import { ComponentStructure, ComponentUIDL, ChunkType, FileType } from '@viasoft/teleport-types'
import { createAngularModulePlugin } from '../src/index'
import projectUIDL from '../../../examples/test-samples/project-sample.json'

describe('Testing the functionality for Angular Modules', () => {
  it('Should add Angular dependencies for root module', async () => {
    const rootModule = createAngularModulePlugin({ moduleType: 'root' })
    const rootUIDL = projectUIDL.root as ComponentUIDL
    const structure: ComponentStructure = {
      uidl: rootUIDL,
      options: {},
      chunks: [],
      dependencies: {},
    }

    const { dependencies, chunks } = await rootModule(structure)

    expect(chunks.length).toBe(2)
    expect(Object.keys(dependencies).length).toBe(6)
    expect(chunks[0].type).toBe(ChunkType.AST)
    expect(chunks[0].fileType).toBe(FileType.TS)
    expect(chunks[0].content).toBeDefined()
    expect(chunks[1].type).toBe(ChunkType.AST)
    expect(chunks[1].fileType).toBe(FileType.TS)
    expect(chunks[1].content).toBeDefined()
  })

  it('Should add Angular dependencies for component module', async () => {
    const componentUIDL = projectUIDL.components.OneComponent as ComponentUIDL
    const componentPlugin = createAngularModulePlugin({ moduleType: 'component' })
    const structure: ComponentStructure = {
      uidl: componentUIDL,
      options: { moduleComponents: { OneComponent: componentUIDL } },
      chunks: [],
      dependencies: {},
    }

    const { dependencies, chunks } = await componentPlugin(structure)

    expect(Object.keys(dependencies).length).toBe(5)
    expect(chunks.length).toBe(1)
    expect(chunks[0].type).toBe(ChunkType.AST)
    expect(chunks[0].fileType).toBe(FileType.TS)
    expect(chunks[0].content).toBeDefined()
  })

  it('Should add Angular dependencies for page module', async () => {
    const componentUIDL = projectUIDL.components.OneComponent as ComponentUIDL
    componentUIDL.outputOptions = componentUIDL.outputOptions || {}
    componentUIDL.name = 'OneComponent'
    componentUIDL.outputOptions.fileName = 'OneComponent'
    componentUIDL.outputOptions.moduleName = 'OneComponentModule'

    const componentPlugin = createAngularModulePlugin({ moduleType: 'page' })
    const structure: ComponentStructure = {
      uidl: componentUIDL,
      options: {},
      chunks: [],
      dependencies: {},
    }

    const { dependencies, chunks } = await componentPlugin(structure)
    const pageComponent = dependencies.OneComponent

    expect(Object.keys(dependencies).length).toBe(6)
    expect(chunks.length).toBe(2)
    expect(chunks[0].type).toBe(ChunkType.AST)
    expect(chunks[0].fileType).toBe(FileType.TS)
    expect(chunks[0].content).toBeDefined()
    expect(chunks[1].type).toBe(ChunkType.AST)
    expect(chunks[1].fileType).toBe(FileType.TS)
    expect(chunks[1].content).toBeDefined()
    expect(pageComponent.type).toBe('local')
  })
})
