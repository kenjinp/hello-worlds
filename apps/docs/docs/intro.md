---
sidebar_position: 1
title: Intro
---

:::caution
I'm changing things up in this library on a _daily_ basis. Expect these docs to be outdated as soon as they are available online! If you need help or want to ask questions,
[reach out on twitter](https://twitter.com/home) or DM me in the [Poimandres Discord](https://discord.gg/papd8Abw5A)
:::

# Use Javascript to create whole worlds!

So you've watched a few videos about procedurally generating planets. Or you've played StarCitizen, and now it's time to implement `StarCitizen.js`. Why not? The browser is a perfect place for large virtual worlds, and game development with javascript or React is both fun and practical. Your rad mmorpg deserves a vast setting to play in. So let's create a world!

## What's all this then?

`hello-worlds` is a collection of libraries that helps you procedurally generate beautiful, fantastic worlds, and populate them with interesting stuff.

Using these libraries, you can create three.js planetoids, moons, earth-sized celestial objects, and eventually more fantastic realms like ring-worlds, donut-earths, inverted dyson-sphere-like worlds, or maybe a disc world. The point is not to be realistic (although you can be), but _fantastic_!

I've created these packages and docs as a way to organize my (limited) knowledge about procedural generation. It might not be useful for your website or game, but you you might be able to learn something from [reading the source](https://github.com/kenjinp/hello-worlds).

## Libraries in hello-worlds

### [`hello-worlds/planets`](/docs/planets/intro)

Create planets in `three.js`.

### [`hello-worlds/react`](/docs/react/intro)

Create `hello-worlds` planets in your `@react-three/fiber` scene via `React`.

### [`hello-worlds/tongues`](/docs/react/tongues)

Generate a plausible-ish randomly generated language.

### [`hello-worlds/cultures`](/docs/react/cultures)

Probably not useful, but interesting. Procedurally generate countries, their languages, and their demographics.

### [`hello-worlds/core`](/docs/react/core)

Core library that each depends on. Mostly useful for setting global `seeds`.
