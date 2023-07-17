import { Noise, remap, smoothMax, smoothMin } from "@hello-worlds/planets"
import { Color, Vector3 } from "three"

export type Crater = {
  floorHeight: number
  radius: number
  center: Vector3
  rimWidth: number
  rimSteepness: number
  smoothness: number
  debugColor: Color
}

export const craterHeight = (
  input: Vector3,
  craters: Crater[],
  noise?: Noise,
) => {
  let craterHeight = 0
  const n = noise ? noise.getFromVector(input) : 0
  for (let i = 0; i < craters.length; i++) {
    const currentPoint = craters[i]
    const { rimWidth, rimSteepness, smoothness, floorHeight, center, radius } =
      currentPoint

    const dist = input.distanceTo(center)
    if (dist > radius * 2) {
      continue
    }
    const x = dist / radius

    // crazy snaky terrace stuff
    const radialDistanceNoise = Math.sin(
      dist * (1 / (remap(radius, 1000, 200_000, 1000, 10000) * n)),
    )

    const cavity = x * x - 1

    const rimX = Math.min(x - 1 - rimWidth, 0)
    const rim = rimSteepness * rimX * rimX
    let craterShape = smoothMax(cavity, floorHeight, smoothness)
    craterShape = smoothMin(
      craterShape,
      rim * smoothMin(0.75, radialDistanceNoise, 0.4),
      smoothness,
    )
    craterHeight += craterShape * radius
  }
  return craterHeight
}

export const pyramidHeight = (
  input: Vector3,
  craters: Crater[],
  noise?: Noise,
) => {
  let craterHeight = 0
  // const n = noise ? noise.getFromVector(input) : 0
  for (let i = 0; i < craters.length; i++) {
    const crater = craters[i]

    const v = input.distanceTo(crater.center) - crater.radius
    // const p = input.clone().sub(crater.center)
    // p.y -= clamp(p.y, 0.0, crater.radius / 2)
    // const v = p.length() - crater.radius

    // sdBox(input.clone(), crater)
    craterHeight = Math.max(craterHeight, v < 0 ? Math.abs(v) : 0)
  }
  return craterHeight
}

// cool crater wiggly lopsided sin wave stuff
// export const craterHeight = (
//   input: Vector3,
//   craters: Crater[],
//   noise?: Noise,
// ) => {
//   let craterHeight = 0
//   const n = noise ? noise.getFromVector(input) : 0
//   for (let i = 0; i < craters.length; i++) {
//     const currentPoint = craters[i]
//     const { rimWidth, rimSteepness, smoothness, floorHeight, center, radius } =
//       currentPoint

//     const dist = input.distanceTo(center)
//     const x = dist / radius

//     const radialDistanceNoise = Math.sin(dist * (1 / (1000 * n)))

//     const cavity = x * x - 1

//     const rimX = Math.min(x - 1 - rimWidth, 0)
//     const rim = rimSteepness * rimX * rimX
//     let craterShape = smoothMax(cavity, floorHeight, smoothness)
//     craterShape = smoothMin(
//       craterShape,
//       rim * smoothMin(0.75, radialDistanceNoise, 0.4),
//       smoothness,
//     )
//     craterHeight += craterShape * radius
//   }
//   return craterHeight
// }
