import { Mapping } from '@viasoft/teleport-types'

export const AngularProjectMapping: Mapping = {
  elements: {
    navlink: {
      elementType: 'a',
      attrs: {
        routerLink: { type: 'dynamic', content: { referenceType: 'attr', id: 'transitionTo' } },
      },
    },
  },
}
