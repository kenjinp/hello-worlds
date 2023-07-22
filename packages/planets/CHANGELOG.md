# @hello-worlds/planets

## 0.0.21

### Patch Changes

- Speed up chunk list generation

## 0.0.20

### Patch Changes

- Add mesh-bvh to Planet type chunk generation

## 0.0.19

### Patch Changes

- Add LODLevel and maxLOD getters to Chunk class

## 0.0.18

### Patch Changes

- Update docs link in npm
- Updated dependencies
  - @hello-worlds/core@0.0.9

## 0.0.17

### Patch Changes

- Add vfx library

## 0.0.16

### Patch Changes

- 70a2f0e: Refactor
- 94cd2d3: Terrain Chunk Skirts
- Changes in chunk generation allowing for chunk skirts
- Updated dependencies [70a2f0e]
- Updated dependencies [94cd2d3]
- Updated dependencies
  - @hello-worlds/core@0.0.8

## 0.0.15

### Patch Changes

- remove sourcemaps from builds, fix exports
- Updated dependencies
  - @hello-worlds/core@0.0.7

## 0.0.14

### Patch Changes

- fix export issue for chunk events

## 0.0.13

### Patch Changes

- expose lodDistanceComparisonValue to allow users to tune the resolution & performance

## 0.0.12

### Patch Changes

Features:

- FlatWorlds

Bugfixes:

- fix a problem with RingWorld normals

Docs:

- updated docs to reflect latest API for @hello-worlds/planets
- added examples for @hello-worlds/planets' world types and for Noise

## 0.0.11

### Patch Changes

- #### Ring Worlds update!

  This is a first crack at creating the geometries necessary for Cylinder/Ring worlds

  Other packages have been effected as math utilities have expanded

- Updated dependencies
  - @hello-worlds/core@0.0.6

## 0.0.10

### Patch Changes

- Fix an error where LODS would only load based on origin 0,0,0

## 0.0.9

### Patch Changes

- Allow for adding r3f <material/> inside <Planet/> children

## 0.0.8

### Patch Changes

- allow threads to be initialized with initialData

## 0.0.7

### Patch Changes

- Fix problem causing Planet to be reinitialized in react for each rerender, causing workers to be added each time

## 0.0.6

### Patch Changes

- changed a bit the material stuff

## 0.0.5

### Patch Changes

- Append chunk material with chunk uniform attributes
- Updated dependencies
  - @hello-worlds/core@0.0.5

## 0.0.4

### Patch Changes

- 3c7154a: fix data property for createThreadedPlanetWorker
- Updated dependencies [3c7154a]
  - @hello-worlds/core@0.0.4

## 0.0.3

### Patch Changes

- fix types and import policy
- Updated dependencies
  - @hello-worlds/core@0.0.3

## 0.0.2

### Patch Changes

- f7ca26e: update docs and change worker thread implementatiton
- Updated dependencies [cb0b9c8]
- Updated dependencies [f7ca26e]
  - @hello-worlds/core@0.0.2

## 0.0.1

### Patch Changes

- 982bb00: Hello World! Break core components into their own libraries
- Updated dependencies [982bb00]
  - @hello-worlds/core@0.0.1
