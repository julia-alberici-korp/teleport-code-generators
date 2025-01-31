import { createReactComponentPlugin } from '../src/index'
import { component, elementNode } from '@teleporthq/teleport-uidl-builders'
import { ComponentStructure, ChunkType, FileType } from '@viasoft/teleport-types'

describe('plugin-react-base-component', () => {
  const plugin = createReactComponentPlugin({
    componentChunkName: 'component-chunk',
    exportChunkName: 'export-chunk',
  })

  it('outputs two AST chunks with the corresponding chunk names', async () => {
    const structure: ComponentStructure = {
      chunks: [],
      options: {},
      uidl: component('Test', elementNode('container')),
      dependencies: {},
    }
    const result = await plugin(structure)

    // no change to the input UIDL
    expect(JSON.stringify(result.uidl)).toBe(JSON.stringify(structure.uidl))

    // AST chunks created
    expect(result.chunks.length).toBe(2)
    expect(result.chunks[0].type).toBe(ChunkType.AST)
    expect(result.chunks[0].content).toBeDefined()
    expect(result.chunks[0].name).toBe('component-chunk')
    expect(result.chunks[1].type).toBe(ChunkType.AST)
    expect(result.chunks[1].content).toBeDefined()
    expect(result.chunks[1].name).toBe('export-chunk')

    // Dependencies
    expect(result.dependencies.React).toBeDefined()
    expect(result.dependencies.useState).toBeUndefined()
  })

  it('adds state hooks when state definitions exist', async () => {
    const structure: ComponentStructure = {
      chunks: [],
      options: {},
      uidl: component(
        'Test',
        elementNode('container'),
        {},
        {
          isVisible: {
            type: 'boolean',
            defaultValue: false,
          },
        }
      ),
      dependencies: {},
    }
    const result = await plugin(structure)

    // AST chunks created
    expect(result.chunks.length).toBe(2)
    expect(result.chunks[0].type).toBe(ChunkType.AST)
    expect(result.chunks[0].content).toBeDefined()
    expect(result.chunks[0].name).toBe('component-chunk')
    expect(result.chunks[1].type).toBe(ChunkType.AST)
    expect(result.chunks[1].content).toBeDefined()
    expect(result.chunks[1].name).toBe('export-chunk')

    // Dependencies
    expect(result.dependencies.React).toBeDefined()
    expect(result.dependencies.useState).toBeDefined()
  })

  it('add DOM injection node to the jsx', async () => {
    const structure: ComponentStructure = {
      chunks: [],
      options: {},
      uidl: component('<h1>Heading</h2>', elementNode('raw')),
      dependencies: {},
    }
    const result = await plugin(structure)

    expect(result.chunks.length).toBe(2)
    expect(result.chunks[1].type).toBe(ChunkType.AST)
    expect(result.chunks[0].fileType).toBe(FileType.JS)
    expect(result.chunks[0].name).toBe('component-chunk')
    expect(result.chunks[0].content).toBeDefined()
  })
})
