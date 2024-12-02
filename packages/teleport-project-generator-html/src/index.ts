import { createProjectGenerator } from '@viasoft/teleport-project-generator'
import { createHTMLComponentGenerator } from '@viasoft/teleport-component-generator-html'
import { createComponentGenerator } from '@viasoft/teleport-component-generator'
import { createStyleSheetPlugin } from '@teleporthq/teleport-plugin-css'
import prettierHTML from '@teleporthq/teleport-postprocessor-prettier-html'
import HTMLTemplate from './project-template'
import { pluginCloneGlobals, ProjectPluginCloneGlobals } from './plugin-clone-globals'
import { pluginHomeReplace } from './plugin-home-replace'
import { htmlErrorPageMapping } from './error-page-mapping'

const createHTMLProjectGenerator = () => {
  const generator = createProjectGenerator({
    id: 'teleport-project-html',
    components: {
      generator: createHTMLComponentGenerator,
      path: ['components'],
    },
    pages: {
      generator: createHTMLComponentGenerator,
      path: [''],
      options: {
        useFileNameForNavigation: true,
      },
    },
    static: {
      prefix: 'public',
      path: ['public'],
    },
    projectStyleSheet: {
      generator: createComponentGenerator,
      plugins: [createStyleSheetPlugin({ fileName: 'style', relativeFontPath: true })],
      fileName: 'style',
      path: [''],
      importFile: true,
    },
    entry: {
      postprocessors: [prettierHTML],
      fileName: 'index',
      path: [''],
    },
  })

  return generator
}

export {
  createHTMLProjectGenerator,
  HTMLTemplate,
  pluginCloneGlobals,
  pluginHomeReplace,
  htmlErrorPageMapping,
  ProjectPluginCloneGlobals,
}
