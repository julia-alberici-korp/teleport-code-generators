# teleport-component-generator-angular

Component generator customization, capable of creating Angular components with styles.

> This package is part of the [teleport ecosystem](https://github.com/teleporthq/teleport-code-generators). For a complete guide, check out the [official documentation](https://docs.teleporthq.io/).

## Install
```bash
npm install @viasoft/teleport-component-generator-angular
```
or
```bash
yarn add @viasoft/teleport-component-generator-angular
```

## Usage
```javascript
import { createAngularComponentGenerator } from '@viasoft/teleport-component-generator-angular'

const angularGenerator = createAngularComponentGenerator()

const result = await angularGenerator.generateComponent(uidl)
```
