<p align="center">
  <img src="./logo.png">
</p>

# Hello Worlds 👋🌐

Your Virtual Worldbuilding toolkit for the web.

Within you'll find a growing collection of tools to plop large planets into your [`three.js`](threejs.org/) scene, and then populate that world with societies and languages.

> **Warning**
> Hic Sunt Dracones!
>
> This library is (extremely!) work-in-progress; meaning that it is not done, or ready for use in any other capacity. Please don't use this and assume that anything will work; it probably won't. And when you find something that does work, be ready for it to break in the next release.
>
> If you're interested in using this library and want to keep up to date, please [follow me on Twitter](https://twitter.com/KennyPirman), and/or click the Watch button for this repository.

## Docs 📄

Visit https://worlds.kenny.wtf

## Packages 🎁

| Name                                          | Description                                                                                                                                                                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@hello-worlds/planets](./packages/planets)   | Tools build large-scale planets, moons, planetoids, ring-worlds (von Braun wheels) and other fantastic environments in [`three.js`](threejs.org/), and help you query against them to create interesting features for your game or web experience. |
| [@hello-worlds/react](./packages/react)       | React.js components to easily integrate `@hello-worlds/planets` and other components into your [`@react-three/fiber`](https://github.com/pmndrs/drei) scene                                                                                        |
| [@hello-worlds/tongues](./packages/tongues)   | Tools to build and operate against [ConLangs](https://en.wikipedia.org/wiki/Constructed_language)                                                                                                                                                  |
| [@hello-worlds/cultures](./packages/cultures) | Tools to generate cultures and societies                                                                                                                                                                                                           |
| [@hello-worlds/core](./packages/core)         | shared utilities                                                                                                                                                                                                                                   |

## Roadmap

This project is large enough in scope to last several lifetimes. Here are a couple of the next tasks on my mind.
Probably not in order.

- [x] Readable Documentation Portal
- [ ] Codesandbox examples (Hello World, Planet, Moon) (In progress!)
- [ ] API docs (In progress!)
- [ ] Make Webworkers optional
- [ ] Enable use in node.js (isomorphic threads)
- [ ] Lifecycle events
- [x] Point-specific height generation example (Moon Craters)
- [ ] Character-on-surface playable example
- [ ] Bezier Curves over a sphere (for labels and such) (might just have example of this)
- [ ] Oceans example and helpers (In progress!)
- [ ] Simple Atmosphere helpers (In progress!)
- [ ] Voronoi subdivision of sphere for... science... (In progress!)

## Questions? 💬

Find me on [Twitter](https://twitter.com/KennyPirman), streaming on [Twitch](https://www.twitch.tv/kennycreates), or the [Poimandres Discord](https://discord.gg/aAYjm2p7c7)

## Where did you get all this crap from? 🤔

[I copied from these smarter people](./SOURCES.md)
