import { Mapping } from '@viasoft/teleport-types'

export const NuxtProjectMapping: Mapping = {
  elements: {
    navlink: {
      elementType: 'nuxt-link',
      attrs: {
        to: { type: 'dynamic', content: { referenceType: 'attr', id: 'transitionTo' } },
      },
    },
    'html-node': {
      elementType: 'DangerousHTML',
      dependency: {
        type: 'package',
        path: 'dangerous-html',
        version: '0.1.13',
        meta: {
          importAlias: 'dangerous-html/dist/vue/lib.js',
        },
      },
    },
    'date-time-node': {
      elementType: 'DateTimePrimitive',
      dependency: {
        type: 'package',
        path: '@teleporthq/react-components',
        version: 'latest',
        meta: {
          namedImport: true,
        },
      },
    },
  },
}
