import { ComponentUIDL, GeneratorOptions } from '@viasoft/teleport-types'
import { wrapHtmlNode } from './utils'

export const resolveHtmlNode = (uidl: ComponentUIDL, options: GeneratorOptions) => {
  uidl.node = wrapHtmlNode(uidl.node, options)
}
