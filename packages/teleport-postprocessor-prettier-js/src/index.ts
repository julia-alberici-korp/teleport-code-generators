import standalone from 'prettier/standalone.js'
const { format } = standalone
import parserBabel from 'prettier/parser-babel.js'
import { Constants } from '@viasoft/teleport-shared'
import { PostProcessor, PrettierFormatOptions, FileType } from '@viasoft/teleport-types'

interface PostProcessorFactoryOptions {
  fileType?: string
  formatOptions?: PrettierFormatOptions
}

export const createPrettierJSPostProcessor = (options: PostProcessorFactoryOptions = {}) => {
  const fileType = options.fileType || FileType.JS
  const formatOptions = { ...Constants.PRETTIER_CONFIG, ...options.formatOptions }

  const plugins = [parserBabel]

  const processor: PostProcessor = (codeChunks) => {
    if (codeChunks[fileType]) {
      codeChunks[fileType] = format(codeChunks[fileType], {
        ...formatOptions,
        plugins,
        parser: 'babel',
      })
    } else {
      console.warn('No code chunk of type JS found, prettier-js did not perform any operation')
    }

    return codeChunks
  }

  return processor
}

export default createPrettierJSPostProcessor()
