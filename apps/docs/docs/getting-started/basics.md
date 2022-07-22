import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import cubeoidURL from "@site/static/img/cube.png"

# Basics

## Planet

Your basic world is created through interacting with the `Planet` class. This will create a large cube, with each of its faces subdivided into a data structure called a `QuadTree`. Don't worry, it will be a sphere in the end, as each point will be bent into shape.

<img src={cubeoidURL} alt="cube projected onto a sphere" />

> from [this gamedev.net post](https://www.gamedev.net/forums/topic/642127-a-pathfinding-on-a-sphere-projected-cube-uneven-planetary-body/5055776/)

<Tabs>
<TabItem value="ts" label="Typescript">

```ts
import { Planet } from "@hello-worlds/planet";
import planetWorker from "./planet.worker";

// ...some threejs scene above

const kerbin = new Planet(
  {
    radius: 4_000,
    minCellSize: 25,
    minCellResolution: 48,
  },
  planetWorker
);
scene.add(kerbin);
```

</TabItem>
<TabItem value="jsx" label="React">

```tsx
import { useThree } from "@react-three/fiber";
import { Planet } from "@hello-worlds/react";
import planetWorker from "./planet.worker";

function Kerbin () {
  const { camera } = useThree();
  return <Planet
    planetProps={{
      radius: 4_000,
      minCellSize: 25,
      minCellResolution: 48,
    }}
    lodOrigin={camera.position}
    worker={planetWorker}
  >
}
```

</TabItem>

</Tabs>

By subdividing each plane into smaller pieces, we can delegate their construction to threads (in the browser called web-workers), which frees up our interactivity and makes the app feel snappier. This technique allows us to create vast earth-size (or larger!) worlds, because the user will only load a small fraction of the world at a given time in any significant detail.

## Web Workers

:::info
The webworker requirement will likely be made optional and not a hard dependency in the future. Also, like.. I want this to work with node.js ¯\\\_(ツ)\_/¯
:::

We will use these web worker 'threads' to calculate the height positions on our planet, as well as the colors of each vertex.

Because we will make use web workers, you'll need a way to tell your bundler to build them.

<Tabs>
<TabItem value="vite" label="Vite">

```ts title="components/planet/Planet.tsx"
// simply import your webworker directly with a query param
import PlanetWorker from "./planet.worker?worker";
```

</TabItem>
<TabItem value="webpack" label="Webpack">

```js title="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      },
    ],
  },
};
```

</TabItem>

</Tabs>

## Generators

How do we add features to our planet? Generators!

Generators are simply functions that take an `x,y,z` position value as an input, and returns an output. You'll have access to other inputs in your webworker generator, but only by knowing the `x,y,z` in world coordinates of your vertex, you can already do many things!

:::info
Generators are ran on the threads, and handle one chunk at a time. They're also _static_, which means once you bundle your app, you won't be able to change them. You should import all the functions you intend to use, as you won't be able to say... pass in a function in the generator input data (without shinanigans!)
:::

### Height Generator

The height generator will be ran inside the chunk web worker first. Usually you'll apply some noise, but you must return a number. We'll use this height number to push the vertex away from the sphere's origin, creating altitude (or lack thereof).

```tsx
const simpleHeight: ChunkGenerator3<ThreadParams, number> = {
  // will create a boring sphere with no height changes!
  get({ input, worldPosition, data }) {
    return 1;
  },
};
```

### Color Generator

The color generator will run after the height generator (and therefore will have access to the heigh details), and will return a `THREE.Color`. We'll use this to paint the vertex in our `THREE.Material`, and thus paint the world!

```tsx
const simpleColor: ChunkGenerator3<ThreadParams, Color> = {
  // this will color everything in a rainbow!
  get({ input, worldPosition, data }) {
    const w = worldPosition.clone().normalize();
    return new Color().setRGB(w.x, w.y, w.z);
  },
};
```
