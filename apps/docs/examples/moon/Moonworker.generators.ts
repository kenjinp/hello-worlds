import { Crater, pyramidHeight } from "@game/generators/craters"
import { setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorGeneratorInitializer,
  LatLong,
  Lerp,
  LinearSpline,
  NOISE_TYPES,
  Noise,
  remap,
} from "@hello-worlds/planets"
import { Color } from "three"
export type ThreadParams = {
  seed: string
  seaLevel?: number
  craters: Crater[]
}

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ radius, data: { craters, seed } }) => {
  const latLong = new LatLong()
  setRandomSeed(seed)
  const sizeConst = 12
  const scaleConst = 15
  const glacierHeightConstant = 10

  const noiseM = new Noise({
    octaves: 5,
    seed,
    height: 2,
    scale: radius * 1.5 * scaleConst,
  })

  const noiseW = new Noise({
    octaves: 2,
    seed: "oh no",
    height: 3,
    scale: (radius / 20) * scaleConst,
  })

  const noiseB = new Noise({
    octaves: 3,
    seed: "blah",
    height: 0.2,
    scale: (radius / 2) * scaleConst,
  })

  const billow = new Noise({
    noiseType: NOISE_TYPES.BILLOWING,
    seed: "strange!",
    height: 40 * sizeConst,
    scale: (radius / 20) * scaleConst,
  })

  const rigid = new Noise({
    noiseType: NOISE_TYPES.RIGID,
    seed: "bizarre!",
    height: 10 * sizeConst,
    scale: (radius / 30) * scaleConst,
  })

  const abs = new Noise({
    noiseType: NOISE_TYPES.FBM,
    seed: "strange!",
    height: 5 * sizeConst,
    scale: (radius / 4) * scaleConst,
  })

  const craterNoise = new Noise({
    seed: "yarg",
    height: 2,
    scale: 1000 * sizeConst,
    noiseType: NOISE_TYPES.RIGID,
  })

  const glacierNoise = new Noise({
    seed: "banana", // <-important
    height: 10.0,
    scale: (radius / 10) * scaleConst,
  })

  const gWarp = new Noise({
    seed: "banana", // <-important
    height: 1 * sizeConst,
    scale: (radius / 2) * scaleConst,
  })

  const oceanMask = new Noise({
    octaves: 3,
    seed: "ocean",
    height: 2,
    scale: radius * 2 * scaleConst,
  })

  return ({ input }) => {
    // const v = craterHeight(input, craters, craterNoise)
    const v = pyramidHeight(input, craters, craterNoise)

    const n = noiseM.getFromVector(input)
    const warp = noiseW.getFromVector(input)
    const dunelandsHeight = billow.getFromVector(input)
    const rigidLandsHeight = rigid.get(
      input.x + n * warp,
      input.y + n * warp,
      input.z + n * warp,
    )
    const absV = abs.get(input.x + warp, input.y + warp, input.z + warp)

    const mask = noiseM.getFromVector(input)
    const maskB = noiseB.getFromVector(input)
    const oceanMaskValue = oceanMask.getFromVector(input)

    latLong.cartesianToLatLong(input)

    const g = gWarp.getFromVector(input)
    const glWarp = glacierNoise.get(input.x + g, input.y + g, input.z + g)
    let glacierFactor = 0
    if (latLong.lat > 75 + glWarp) {
      glacierFactor = glacierHeightConstant
    }
    if (latLong.lat < -75 + glWarp) {
      glacierFactor = glacierHeightConstant
    }

    const craterHeightHeights = v //Math.max(v, -1000)

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
  data: { craters, seed },
}) => {
  const latLong = new LatLong()

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
    for (let i = 0; i < craters.length; i++) {
      const crater = craters[i]
      if (worldPosition.distanceTo(crater.center) <= crater.radius) {
        return crater.debugColor
      }
    }
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
