import { generator as babelCodeGenerator } from './generators/js-ast-to-code'
import { generator as htmlGenerator } from './generators/html-to-string'
import {
  ChunkDefinition,
  CodeGeneratorFunction,
  ChunkContent,
  ChunkType,
} from '@viasoft/teleport-types'

export default class Builder {
  private chunkDefinitions: ChunkDefinition[] = []

  private generators: { [key: string]: CodeGeneratorFunction<ChunkContent> } = {
    [ChunkType.AST]: babelCodeGenerator,
    [ChunkType.HAST]: htmlGenerator,
    [ChunkType.STRING]: (str: string) => str, // no-op for string chunks
  }

  constructor(chunkDefinitions: ChunkDefinition[] = []) {
    this.chunkDefinitions = chunkDefinitions
  }

  /**
   * Links all chunks together based on their requirements. Returns an array
   * of ordered chunk names which need to be compiled and glued together.
   */
  public link(chunkDefinitions: ChunkDefinition[] = []): string {
    const chunks = chunkDefinitions || this.chunkDefinitions
    if (chunks.length <= 0) {
      return ''
    }

    const unprocessedChunks = chunks.map((chunk) => {
      return {
        name: chunk.name,
        type: chunk.type,
        content: chunk.content,
        linkAfter: this.cleanupInvalidChunks(chunk.linkAfter, chunks),
      }
    })

    const resultingString: string[] = []

    while (unprocessedChunks.length > 0) {
      let indexToRemove = 0
      for (let index = 0; index < unprocessedChunks.length; index++) {
        if (unprocessedChunks[index].linkAfter.length <= 0) {
          indexToRemove = index
          break
        }
      }

      if (unprocessedChunks[indexToRemove].linkAfter.length > 0) {
        console.info('Operation aborted. Reason: cyclic dependency between chunks.')
        return ''
      }

      const { type, content, name } = unprocessedChunks[indexToRemove]
      const compiledContent = this.generateByType(type, content)
      if (compiledContent) {
        resultingString.push(compiledContent + '\n')
      }

      unprocessedChunks.splice(indexToRemove, 1)
      unprocessedChunks.forEach(
        // remove the processed chunk from all the linkAfter arrays from the remaining chunks
        (ch) => (ch.linkAfter = ch.linkAfter.filter((after) => after !== name))
      )
    }

    return resultingString.join('\n')
  }

  public generateByType(type: string, content: unknown): string {
    if (!content) {
      return ''
    }
    if (Array.isArray(content)) {
      return content.map((contentItem) => this.generateByType(type, contentItem)).join('\n')
    }

    if (!this.generators[type]) {
      throw new Error(
        `Attempted to generate unknown type ${type}. Please register a generator for this type in builder/index.ts`
      )
    }

    return this.generators[type](content)
  }

  // remove invalid chunks (which did not end up being created) from the linkAfter fields
  // one use-case is when you want to remove the import plugin
  private cleanupInvalidChunks(linkAfter: string[], chunks: ChunkDefinition[]) {
    return linkAfter.filter((chunkName) => chunks.some((chunk) => chunk.name === chunkName))
  }
}
