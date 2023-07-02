import { Crater, craterHeight } from "@game/generators/craters"
import { setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorGeneratorInitializer,
  LatLong,
  Lerp,
  LinearSpline,
  NOISE_TYPES,
  Noise,
  createThreadedPlanetWorker,
  remap,
} from "@hello-worlds/planets"
import { Color } from "three"
export type ThreadParams = {
  seed: string
  seaLevel?: number
  craters: Crater[]
}

// export const volcanoHeight = (input: Vector3, craters: Crater[]) => {
//   let craterHeight = 0
//   for (let i = 0; i < craters.length; i++) {
//     const currentCrater = craters[i]
//     const { rimWidth, rimSteepness, smoothness, floorHeight, center, radius } =
//       currentCrater

//     const dist = input.distanceTo(center)
//     let x = 0
//     if (dist < radius) {
//       x = smoothMax(dist, radius, 0.5)
//     }

//     craterHeight += x
//   }
//   return craterHeight
// }

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ radius, data: { craters, seed } }) => {
  const latLong = new LatLong()
  setRandomSeed(seed)

  const noiseM = new Noise({
    octaves: 5,
    seed,
    height: 1,
    scale: radius,
  })

  const noiseB = new Noise({
    octaves: 3,
    seed: "blah",
    height: 0.2,
    scale: radius / 2,
  })

  const billow = new Noise({
    noiseType: NOISE_TYPES.BILLOWING,
    seed: "strange!",
    height: 40_000,
    scale: radius / 20,
  })

  const rigid = new Noise({
    noiseType: NOISE_TYPES.RIGID,
    seed: "bizarre!",
    height: 7_000,
    scale: radius / 20,
  })

  const abs = new Noise({
    noiseType: NOISE_TYPES.FBM,
    seed: "strange!",
    height: 5_000,
    scale: radius / 4,
  })

  const craterNoise = new Noise({
    seed: "yarg",
    height: 2,
    scale: 1000000,
    noiseType: NOISE_TYPES.RIGID,
  })

  const glacierNoise = new Noise({
    seed: "banana", // <-important
    height: 10.0,
    scale: radius / 10,
  })

  const gWarp = new Noise({
    seed: "banana", // <-important
    height: 1000.0,
    scale: radius / 2,
  })

  const oceanMask = new Noise({
    octaves: 3,
    seed: "ocean",
    height: 2,
    scale: radius * 2,
  })

  return ({ input }) => {
    const v = craterHeight(input, craters, craterNoise)

    const n = noiseM.getFromVector(input)
    const dunelandsHeight = billow.getFromVector(input)
    const rigidLandsHeight = rigid.get(input.x + n, input.y + n, input.z + n)
    const absV = abs.get(input.x + n, input.y + n, input.z + n)

    const mask = noiseM.getFromVector(input)
    const maskB = noiseB.getFromVector(input)
    const oceanMaskValue = oceanMask.getFromVector(input)

    latLong.cartesianToLatLong(input)

    const g = gWarp.getFromVector(input)
    const glWarp = glacierNoise.get(input.x + g, input.y + g, input.z + g)
    let glacierFactor = 0
    if (latLong.lat > 75 + glWarp) {
      glacierFactor = 100
    }
    if (latLong.lat < -75 + glWarp) {
      glacierFactor = 100
    }

    const craterHeightHeights = Math.max(v, -1000)

    return (
      rigidLandsHeight * mask +
      dunelandsHeight * maskB +
      Math.abs(absV) * -oceanMaskValue +
      craterHeightHeights +
      glacierFactor
    )
  }
}

const oceanColor = new Color(0x33495d)
const glacierColor = new Color(0xffffff)

const colorLerp: Lerp<THREE.Color> = (
  t: number,
  p0: THREE.Color,
  p1: THREE.Color,
) => {
  const c = p0.clone()
  return c.lerp(p1, t)
}

const colorSpline = new LinearSpline<THREE.Color>(colorLerp)
const tropicalSpline = new LinearSpline<THREE.Color>(colorLerp)
const algea = new Color(0x4b692f)

// Temp / Aridity
colorSpline.addPoint(0, algea)
colorSpline.addPoint(0.02, new Color(0xdf7126))
colorSpline.addPoint(0.03, new Color(0xd9a066))
colorSpline.addPoint(0.15, new Color(0xeec39a))
colorSpline.addPoint(0.5, new Color(0x696a6a))
colorSpline.addPoint(0.7, new Color(0x323c39))
colorSpline.addPoint(1.0, new Color(0xbab3a2))

tropicalSpline.addPoint(0, algea)
tropicalSpline.addPoint(0.1, new Color(0xdf7126))
tropicalSpline.addPoint(0.12, new Color(0xd9a066))
tropicalSpline.addPoint(0.15, new Color(0xeec39a))
tropicalSpline.addPoint(0.5, new Color(0x696a6a))
tropicalSpline.addPoint(0.7, new Color(0x323c39))
tropicalSpline.addPoint(1.0, new Color(0xbab3a2))

export const colorGenerator: ColorGeneratorInitializer<ThreadParams> = ({
  radius,
}) => {
  const latLong = new LatLong()
  const warp01 = new Noise({
    octaves: 8,
    seed: "warp", // <-important
    height: 4,
    scale: radius / 10,
  })
  const warp = new Noise({
    octaves: 8,
    seed: "apple", // <-important
    height: 200.0,
    scale: 1000,
  })

  const glacierNoise = new Noise({
    seed: "banana", // <-important
    height: 10.0,
    scale: radius / 10,
  })

  const gWarp = new Noise({
    seed: "banana", // <-important
    height: 1000.0,
    scale: radius / 2,
  })

  return ({ height, input, worldPosition }) => {
    // take inputPosition
    // convert to LatLon
    latLong.cartesianToLatLong(worldPosition)

    const g = gWarp.getFromVector(worldPosition)
    // const warp01Value = warp01.getFromVector(worldPosition)
    const noiseWarpValue = glacierNoise.get(
      worldPosition.x + g,
      worldPosition.y + g,
      worldPosition.z + g,
    )

    // const isTropics =
    //   latLong.lat < 20 + warp01Value && latLong.lat > -(20 + warp01Value)

    if (latLong.lat > 75 + noiseWarpValue) {
      return glacierColor
    }
    if (latLong.lat < -75 + noiseWarpValue) {
      return glacierColor
    }

    const warpedHeight = height + warp.getFromVector(worldPosition)
    const highlats = colorSpline.get(remap(warpedHeight, -100, 4_000, 0, 1))
    const tropics = tropicalSpline.get(remap(warpedHeight, -100, 4_000, 0, 1))

    return warpedHeight > -100 // "sealevel"
      ? tropics.lerp(highlats, remap(Math.abs(latLong.lat), 0, 90, 0, 4))
      : oceanColor
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  // @ts-ignore
  colorGenerator,
})
