import { Crater, craterHeight } from "@game/generators/craters"
import { setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorGeneratorInitializer,
  Lerp,
  LinearSpline,
  NOISE_TYPES,
  Noise,
  createThreadedPlanetWorker,
  remap,
  smoothMax,
} from "@hello-worlds/planets"
import { Color, Vector3 } from "three"
export type ThreadParams = {
  seed: string
  seaLevel?: number
  craters: Crater[]
}

export const volcanoHeight = (input: Vector3, craters: Crater[]) => {
  let craterHeight = 0
  for (let i = 0; i < craters.length; i++) {
    const currentCrater = craters[i]
    const { rimWidth, rimSteepness, smoothness, floorHeight, center, radius } =
      currentCrater

    const dist = input.distanceTo(center)
    let x = 0
    if (dist < radius) {
      x = smoothMax(dist, radius, 0.5)
    }

    craterHeight += x
  }
  return craterHeight
}

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ radius, data: { craters, seed } }) => {
  setRandomSeed(seed)

  // const craters: Crater[] = Array(700)
  //   .fill(0)
  //   .map(() => {
  //     const center = randomSpherePoint(0, 0, 0, radius)
  //     const randomRadius = getRndBias(0.005, radius / 50, 3, 0.9)
  //     return {
  //       floorHeight: randomRange(-0.05, 0),
  //       radius: randomRadius,
  //       center,
  //       rimWidth: randomRange(0.5, 0.9),
  //       rimSteepness: randomRange(0.05, 0.7),
  //       smoothness: randomRange(0.001, 0.03),
  //     }
  //   })

  const noiseM = new Noise({
    octaves: 3,
    seed,
    height: 1,
    scale: radius,
  })

  const noiseB = new Noise({
    octaves: 3,
    seed: "blah",
    height: 1,
    scale: radius / 2,
  })

  const billow = new Noise({
    noiseType: NOISE_TYPES.BILLOWING,
    seed: "strange!",
    height: 40_000,
    scale: radius / 20,
  })

  const huh = new Noise({
    seed: "asdfasd!",
    height: 1000,
    scale: radius / 10,
  })

  const rigid = new Noise({
    noiseType: NOISE_TYPES.RIGID,
    seed: "strange!",
    height: 40_000,
    scale: radius / 20,
  })

  // const noise = new Noise({
  //   seed: "blip",
  //   height: 5_000,
  //   scale: radius / 10,
  //   noiseType: NOISE_TYPES.FBM,
  // })

  const craterNoise = new Noise({
    seed: "blorp",
    height: 2,
    scale: 1000000,
    noiseType: NOISE_TYPES.RIGID,
  })

  return ({ input }) => {
    const v = craterHeight(input, craters, craterNoise)

    const n = noiseM.get(input.x, input.y, input.z)
    const b = billow.get(input.x, input.y, input.z)
    const r = rigid.get(input.x + n, input.y + n, input.z + n)

    const mask = noiseM.get(input.x, input.y, input.z)
    const maskB = noiseB.get(input.x, input.y, input.z)
    return r * mask + b * maskB + Math.max(v, -1000)
    // return noise.getFromVector(input) + Math.max(v, -1000)
  }
}

const oceanColor = new Color(0x33495d)

const colorLerp: Lerp<THREE.Color> = (
  t: number,
  p0: THREE.Color,
  p1: THREE.Color,
) => {
  const c = p0.clone()
  return c.lerp(p1, t)
}

const colorSpline = new LinearSpline<THREE.Color>(colorLerp)

// Temp / Aridity
colorSpline.addPoint(0, new Color(0x4b692f))
colorSpline.addPoint(0.02, new Color(0xdf7126))
colorSpline.addPoint(0.03, new Color(0xd9a066))
colorSpline.addPoint(0.15, new Color(0xeec39a))
colorSpline.addPoint(0.5, new Color(0x696a6a))
colorSpline.addPoint(0.7, new Color(0x323c39))
colorSpline.addPoint(1.0, new Color(0xbab3a2))
export const colorGenerator: ColorGeneratorInitializer<ThreadParams> = () => {
  const warp = new Noise({
    octaves: 8,
    seed: "apple", // <-important
    height: 200.0,
    scale: 1000,
  })

  return ({ height, input }) => {
    const warpedHeight = height + warp.getFromVector(input)
    return warpedHeight > -100
      ? colorSpline.get(remap(warpedHeight, -100, 4_000, 0, 1))
      : oceanColor
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  // @ts-ignore
  colorGenerator,
})
