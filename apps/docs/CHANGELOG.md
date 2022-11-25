# docs

## 0.0.14

### Patch Changes

- Updated dependencies
  - @hello-worlds/planets@0.0.15
  - @hello-worlds/react@0.0.16
  - @hello-worlds/core@0.0.7
  - @hello-worlds/cultures@0.0.8

## 0.0.13

### Patch Changes

- Updated dependencies
  - @hello-worlds/react@0.0.15

## 0.0.12

### Patch Changes

- expose lodDistanceComparisonValue to allow users to tune the resolution & performance
- Updated dependencies
  - @hello-worlds/planets@0.0.13
  - @hello-worlds/react@0.0.13

## 0.0.11

### Patch Changes

Features:

- FlatWorlds

Bugfixes:

- fix a problem with RingWorld normals

Docs:

- updated docs to reflect latest API for @hello-worlds/planets
- added examples for @hello-worlds/planets' world types and for Noise

- Updated dependencies
  - @hello-worlds/cultures@0.0.7
  - @hello-worlds/planets@0.0.12
  - @hello-worlds/react@0.0.12

## 0.0.10

### Patch Changes

- # Ring Worlds update!

  This is a first crack at creating the geometries necessary for Cylinder/Ring worlds

  Other packages have been effected as math utilities have expanded

- Updated dependencies
  - @hello-worlds/core@0.0.6
  - @hello-worlds/cultures@0.0.6
  - @hello-worlds/planets@0.0.11
  - @hello-worlds/react@0.0.11

## 0.0.9

### Patch Changes

- Fix an error where LODS would only load based on origin 0,0,0
- Updated dependencies
  - @hello-worlds/planets@0.0.10
  - @hello-worlds/react@0.0.10

## 0.0.8

### Patch Changes

- Allow for adding r3f <material/> inside <Planet/> children
- Updated dependencies
  - @hello-worlds/planets@0.0.9
  - @hello-worlds/react@0.0.9

## 0.0.7

### Patch Changes

- allow threads to be initialized with initialData
- Updated dependencies
  - @hello-worlds/planets@0.0.8
  - @hello-worlds/react@0.0.8

## 0.0.6

### Patch Changes

- Fix problem causing Planet to be reinitialized in react for each rerender, causing workers to be added each time
- Updated dependencies
  - @hello-worlds/planets@0.0.7
  - @hello-worlds/react@0.0.7

## 0.0.5

### Patch Changes

- Updated dependencies
  - @hello-worlds/planets@0.0.6
  - @hello-worlds/react@0.0.6

## 0.0.4

### Patch Changes

- Append chunk material with chunk uniform attributes
- Updated dependencies
  - @hello-worlds/core@0.0.5
  - @hello-worlds/cultures@0.0.5
  - @hello-worlds/planets@0.0.5
  - @hello-worlds/react@0.0.5

## 0.0.3

### Patch Changes

- 3c7154a: fix data property for createThreadedPlanetWorker
- Updated dependencies [3c7154a]
  - @hello-worlds/core@0.0.4
  - @hello-worlds/cultures@0.0.4
  - @hello-worlds/planets@0.0.4
  - @hello-worlds/react@0.0.4

## 0.0.2

### Patch Changes

- fix types and import policy
- Updated dependencies
  - @hello-worlds/core@0.0.3
  - @hello-worlds/cultures@0.0.3
  - @hello-worlds/planets@0.0.3
  - @hello-worlds/react@0.0.3

## 0.0.1

### Patch Changes

- f7ca26e: update docs and change worker thread implementatiton
- Updated dependencies [cb0b9c8]
- Updated dependencies [f7ca26e]
  - @hello-worlds/core@0.0.2
  - @hello-worlds/planets@0.0.2
  - @hello-worlds/react@0.0.2
  - @hello-worlds/cultures@0.0.2
