### Installation
```
npm install semantic-ui-react-single
```
or
```
yarn add semantic-ui-react-single
```
### Description
This package gives you convenient way to import semantic-ui-react components one-by-one. For example:
```ts
import { Menu } from 'semantic-ui-react-single/Menu'
import { Dropdown } from 'semantic-ui-react-single/Dropdown'
import { Segment } from 'semantic-ui-react-single/Segment'
```

Each component includes an import of corresponding CSS file, thus you have to have a loader to handle it.

Also, each component have TypeScript declaration.

In order to make this package work properly, you have to import module with the common CSS:
```ts
import 'semantic-ui-react-single/css'
```