# TerrainSplatting

```
// const splatNoise = new Noise({
//   ...DEFAULT_NOISE_PARAMS,
//   height: 1,
//   scale: 10_000,
//   seed: "Texture Test",
// })

// let max = 0
// let min = 0

// const getTerrainSplats = (
//   position: Vector3,
//   normal: Vector3,
//   up: Vector3,
// ): TerrainSplatDictionary => {
//   const types: TerrainSplatDictionary = {
//     rock: { index: 0, strength: 0.0 },
//     grass: { index: 1, strength: 0.0 },
//     dirt: { index: 2, strength: 0.0 },
//     dirtN: { index: 3, strength: 0.0 },
//   }

//   const sn = splatNoise.get(position.x, position.y, position.z)
//   max = Math.max(sn, max)
//   min = Math.min(sn, min)
//   const n = sn

//   function _ApplyWeights(splatKey: string, v: number, m: number) {
//     for (let k in types) {
//       types[k].strength *= m
//     }
//     types[splatKey].strength = v
//   }

//   // default
//   types.rock.strength = 1.0

//   if (n < 0.1) {
//     _ApplyWeights("rock", 1.0 - n, n)
//   } else if (n < 0.2) {
//     _ApplyWeights("grass", 1.0 - n, n)
//   } else if (n < 0.3) {
//     _ApplyWeights("dirt", 1.0 - n, n)
//   } else {
//     _ApplyWeights("dirtN", 1.0 - n, n)
//   }

//   let total = 0.0
//   for (let k in types) {
//     total += types[k].strength
//   }
//   const normalization = 1.0 / total
//   for (let k in types) {
//     types[k].strength /= normalization
//   }
//   return types
// }
```
