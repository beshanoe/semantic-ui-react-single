This package gives you convenient way to import semantic-ui-react components one-by-one. For example:
```ts
import { Menu } from 'semantic-ui-react-single/Menu'
import { Dropdown } from 'semantic-ui-react-single/Dropdown'
import { Segment } from 'semantic-ui-react-single/Segment'
```

Each component includes an import of corresponding CSS file, thus you have to have a loader to handle it.

Also, each component have TypeScript declaration.

In order to make this package work properly, you still have to import some CSS files explicitly:
```ts
import 'semantic-ui-css/components/reset.min.css'
import 'semantic-ui-css/components/site.min.css'
import 'semantic-ui-css/components/transition.min.css'
```
Also, if you haven't imported Dimmer component explicitly, it's CSS needs to be imported to make other components like Modal work:
```ts
import 'semantic-ui-css/components/dimmer.min.css'
```