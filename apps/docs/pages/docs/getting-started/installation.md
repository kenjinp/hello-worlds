---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

`hello-worlds` is essentially a set of npm packages. If you're familiar with js, you'll be right at home.

## Requirements

We make use of web-workers (for now). Therefore you'll require a bundler, such as `webpack` or `vite`, or `esbuild`. More on this in the next section.

## Packages

You'll need `three.js` installed, as it is a peer dependency. If you plan to use the `@react-three/fiber` react library, you'll also want to install `@hello-worlds/react`

`hello-worlds` is typed out-of-the-box for typescript users.

<Tabs>
<TabItem value="three" label="Three.js">

```bash
# install packages
npm install three @hello-worlds/planets @hello-worlds/core

```

</TabItem>
<TabItem value="jsx" label="@react-three/fiber">

```bash
# install packages
npm install three @hello-worlds/planets @hello-worlds/react @hello-worlds/core

```

</TabItem>

</Tabs>
