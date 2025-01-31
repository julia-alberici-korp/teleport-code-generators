import * as types from '@babel/types'
import { UIDLUtils } from '@viasoft/teleport-shared'
import { ASTUtils, ASTBuilders } from '@viasoft/teleport-plugin-common'
import {
  UIDLMetaTag,
  ComponentUIDL,
  UIDLComponentSEO,
  UIDLPropDefinition,
  UIDLStateDefinition,
  UIDLEventHandlerStatement,
  UIDLPropCallEvent,
} from '@viasoft/teleport-types'

export const generateExportAST = (
  uidl: ComponentUIDL,
  propDefinitions: Record<string, UIDLPropDefinition>,
  stateDefinitions: Record<string, UIDLStateDefinition>,
  dataObject: Record<string, unknown>,
  methodsObject: Record<string, UIDLEventHandlerStatement[]>,
  t = types
) => {
  const componentName = UIDLUtils.getComponentClassName(uidl)
  let angularMethodsAST: types.ClassMethod[] = []
  if (Object.keys(methodsObject).length > 0) {
    angularMethodsAST = createMethodsObject(methodsObject, propDefinitions)
  }

  const { importDefinitions = {} } = uidl

  const propDeclaration = Object.keys(propDefinitions).map((propKey) => {
    const definition = propDefinitions[propKey]
    // By default any prop with type function is used to emitting events to the callee
    if (definition.type === 'func') {
      return t.classProperty(
        t.identifier(propKey),
        t.newExpression(t.identifier('EventEmitter'), []),
        t.typeAnnotation(
          t.genericTypeAnnotation(
            t.identifier('EventEmitter'),
            t.typeParameterInstantiation([t.anyTypeAnnotation()])
          )
        ),
        [t.decorator(t.callExpression(t.identifier('Output'), []))]
      )
    }

    if (definition.type === 'element') {
      return t.classProperty(
        t.identifier(propKey),
        null,
        t.tsTypeAnnotation(
          t.tsTypeReference(
            t.identifier('TemplateRef'),
            t.tsTypeParameterInstantiation([t.tsAnyKeyword()])
          )
        ),
        [t.decorator(t.callExpression(t.identifier('ContentChild'), [t.stringLiteral(propKey)]))]
      )
    }

    return t.classProperty(
      t.identifier(propKey),
      ASTUtils.convertValueToLiteral(propDefinitions[propKey].defaultValue),
      t.tsTypeAnnotation(ASTUtils.getTSAnnotationForType(propDefinitions[propKey].type)),
      [t.decorator(t.callExpression(t.identifier('Input'), []))]
    )
  })

  const propertyDecleration = Object.keys(stateDefinitions).map((stateKey) =>
    t.classProperty(
      t.identifier(stateKey),
      ASTUtils.convertValueToLiteral(stateDefinitions[stateKey].defaultValue),
      t.tsTypeAnnotation(ASTUtils.getTSAnnotationForType(stateDefinitions[stateKey].type))
    )
  )

  const dataDeclaration = Object.keys(dataObject).map((dataKey) => {
    return t.classProperty(
      t.identifier(dataKey),
      ASTUtils.convertValueToLiteral(dataObject[dataKey]),
      t.tsTypeAnnotation(ASTUtils.getTSAnnotationForType(typeof dataObject[dataKey]))
    )
  })

  const referencedImportDeclarations = Object.keys(importDefinitions).reduce((acc, importRef) => {
    if (!importDefinitions[importRef]?.meta?.importJustPath) {
      acc.push(t.classProperty(t.identifier(importRef), t.identifier(importRef)))
    }
    return acc
  }, [])

  const classBodyAST = (componentUIDL: ComponentUIDL) => {
    return t.classBody([
      ...propDeclaration,
      ...propertyDecleration,
      ...dataDeclaration,
      ...referencedImportDeclarations,
      constructorAST(componentUIDL.seo),
      ...angularMethodsAST,
    ])
  }

  return t.exportNamedDeclaration(
    t.classDeclaration(t.identifier(componentName), null, classBodyAST(uidl), null),
    [],
    null
  )
}

const constructorAST = (seo: UIDLComponentSEO, t = types) => {
  const params = []
  const blockStatements = []
  if (seo) {
    const { title, metaTags } = seo

    if (title) {
      params.push(t.identifier(`private title: Title`))
      blockStatements.push(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.memberExpression(t.thisExpression(), t.identifier('title')),
              t.identifier('setTitle')
            ),
            // TODO: Add support for dynamic title here
            [t.stringLiteral(title as string)]
          )
        )
      )
    }

    if (metaTags && metaTags.length > 0) {
      params.push(t.identifier(`private meta: Meta`))

      blockStatements.push(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.memberExpression(t.thisExpression(), t.identifier('meta')),
              t.identifier('addTags')
            ),
            [t.arrayExpression(constructMetaTagAST(metaTags))]
          )
        )
      )
    }
  }

  return t.classMethod(
    'constructor',
    t.identifier('constructor'),
    params,
    t.blockStatement(blockStatements)
  )
}

const constructMetaTagAST = (metaTags: UIDLMetaTag[]) => {
  const metaTagsAST: types.ObjectExpression[] = []
  metaTags.forEach((tag: UIDLMetaTag) => {
    metaTagsAST.push(ASTUtils.objectToObjectExpression(tag))
  })
  return metaTagsAST
}

const createMethodsObject = (
  methods: Record<string, UIDLEventHandlerStatement[]>,
  propDefinitions: Record<string, UIDLPropDefinition>,
  t = types
) => {
  return Object.keys(methods).map((eventKey) => {
    const astStatements: types.ExpressionStatement[] = []
    methods[eventKey].map((statement) => {
      const astStatement =
        statement.type === 'propCall'
          ? createPropCallStatement(statement, propDefinitions)
          : ASTBuilders.createStateChangeStatement(statement)

      if (astStatement) {
        astStatements.push(astStatement)
      }
    })
    return t.classMethod('method', t.identifier(eventKey), [], t.blockStatement(astStatements))
  })
}

export const createPropCallStatement = (
  eventHandlerStatement: UIDLPropCallEvent,
  propDefinitions: Record<string, UIDLPropDefinition>,
  t = types
) => {
  const { calls: propFunctionKey } = eventHandlerStatement

  if (!propFunctionKey) {
    console.warn(`No prop definition referenced under the "calls" field`)
    return null
  }

  const propDefinition = propDefinitions[propFunctionKey]

  if (!propDefinition) {
    console.warn(`No prop definition was found for function "${propFunctionKey}"`)
    return null
  }

  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        t.memberExpression(t.thisExpression(), t.identifier(propFunctionKey)),
        t.identifier('emit')
      ),
      []
    )
  )
}
