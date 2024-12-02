# teleport-component-generator-react

Component generator customization, capable of creating React components with a number of different style flavors.

> This package is part of the [teleport ecosystem](https://github.com/teleporthq/teleport-code-generators). For a complete guide, check out the [official documentation](https://docs.teleporthq.io/).

## Install
```bash
npm install @viasoft/teleport-component-generator-react
```
or
```bash
yarn add @viasoft/teleport-component-generator-react
```

## Usage
```javascript
import { createReactComponentGenerator, ReactStyleVariation } from '@viasoft/teleport-component-generator-react'

// other style options: "CSS", "InlineStyles", "StyledComponents", "StyledJSX", "ReactJSS"
const reactGenerator = createReactComponentGenerator(ReactStyleVariation.CSSModules)

const result = await reactGenerator.generateComponent(uidl)
```

