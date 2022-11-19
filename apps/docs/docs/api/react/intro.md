---
sidebar_position: 3
---

# Planet API

Planet is the basic component to get... well... a Planet in your scene!

It's super easy to add:

```tsx
<Planet
  planetProps={planetProps}
  lodOrigin={camera.position}
  worker={planetWorker}
  initialData={initialData}
  data={crater}
>
  <meshBasicMaterial />
</Planet>
```

## Props

### planetProps

These are your basic planet dimensions. They also dictate the resolution of each terrain subdivision.

:::caution
Updating these props will cause the Planet to be reset entirely! (expensive)
:::

:::info
This value should be memo-ized. If you define the object in the render function of your react component, it will re-render the planet every time the parent component rerenders (might be a lot!)
:::

```tsx
export interface PlanetProps {
  radius: number
  invert?: boolean
  minCellSize: number
  minCellResolution: number
}
```

#### radius

How big?

#### invert

Is your planet an innie or an outtie? (terrain multiplied by 1, or -1). This can be used to create inverted worlds, such that the characters are inside a dyson sphere.

#### minCellSize

the smallest chunk size, the bigger this is, the bigger your chunks.

#### minCellResolution

how many subdivisions your smallest chunk has. The bigger the number, the slower this will be.

### lodOrigin

A `Vector3`. This is the point in space where the level of detail of the planet will be resolved. If it's close to the surface, high-resolution chunks will be rendered around this point. If it's far away, the planet will render lower resolution chunks.

:::tip
In most cases, this would be your scene's camera position
:::

### worker

A Planet worker exported with `createThreadedPlanetWorker`.

:::caution
This is a WIP implementation. likely to be torn asunder.
:::

```tsx title="components/planet/Planet.worker.ts"
// generate a smooth planet
const simpleHeight: ChunkGenerator3Initializer<ThreadParams, number> = ({
  initialData: {},
}) => {
  return () => {
    return 1
  }
}
// generate a color per-chunk
const simpleColor: ChunkGenerator3Initializer<ThreadParams, Color> = () => {
  const chunkColor = new Color(Math.random() * 0xffffff)
  return () => {
    return chunkColor
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: simpleHeight,
  colorGenerator: simpleColor,
})
```

### initialData

This can be any object that will be passed to your worker's `ChunkGenerator3Initializer` function. It's something akin to a shader's `uniform`. It's an optimization intended to allow passing large data sets to the worker just once.

You will only have a set number of worker threads calculating the chunks, and these threads will be constant through through the lifecycle of your `<Planet/>`. This data is passed to your workers only once, when your worker thread is bootstrapped into existence, and will persist as long as your planet does.

```tsx title="components/planet/Planet.worker.ts"
const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  // will be passed to the chunkInitializer as initialData
  initialData: { randomPoints },
}) => {
  return () => {
    let height = 0
    for (let i = 0; i < randomPoints.length; i++) {
      // Do some magic with your fancy data!
      // ...blah blah blah
    }
    return height
  }
}
```

:::tip
Use this for big things, such as a spatial hashes of where you'd like all your crazy volcanos to be!
:::

:::caution
Updating this will cause the Planet to be reset entirely! (expensive)
:::

### data

These props are sent to the worker's color and height generators each time a new chunk is requested to be built by the planet engine. It's especially useful for debugging or tweaking values, before baking them in `initialData`.

:::caution
Changing these props will cause your planet's chunks to rerender, but not your planet!
:::

```tsx title="components/planet/Planet.worker.ts"
const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  initialData: { randomPoints },
}) => {
  return ({
    // will be passed to the chunkInitializer here
    data: { craterRadius, craterDepth },
  }) => {
    let height = 0
    for (let i = 0; i < randomPoints.length; i++) {
      // Do some magic with your fancy data!
      // ...blah blah blah
    }
    return height
  }
}
```
