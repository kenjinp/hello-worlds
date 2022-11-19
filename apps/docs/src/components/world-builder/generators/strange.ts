import { setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorGeneratorInitializer,
  DEFAULT_NOISE_PARAMS,
  Lerp,
  LinearSpline,
  Noise,
  NOISE_STYLES,
  remap,
} from "@hello-worlds/planets"
import { Color } from "three"
import { ThreadParams } from "../WorldBuilder.worker"

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ data: { seed, type }, radius }) => {
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
    ...DEFAULT_NOISE_PARAMS,
    octaves: 3,
    seed,
    height: 1,
    scale: radius,
  })

  const noiseB = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 3,
    seed: "blah",
    height: 1,
    scale: radius / 2,
  })

  const billow = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    noiseType: NOISE_STYLES.billowing,
    seed: "strange!",
    height: 40_000,
    scale: radius / 20,
  })

  const huh = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "asdfasd!",
    height: 1000,
    scale: radius / 10,
  })

  const rigid = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    noiseType: NOISE_STYLES.rigid,
    seed: "strange!",
    height: 40_000,
    scale: radius / 20,
  })

  return ({ input }) => {
    const n = noiseM.get(input.x, input.y, input.z)
    const b = billow.get(input.x, input.y, input.z)
    const r = rigid.get(input.x + n, input.y + n, input.z + n)

    const mask = noiseM.get(input.x, input.y, input.z)
    const maskB = noiseB.get(input.x, input.y, input.z)
    return r * mask + b * maskB
  }
}

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
colorSpline.addPoint(0.0, new Color(0x37a726))
colorSpline.addPoint(0.05, new Color(0x214711))
colorSpline.addPoint(0.4, new Color(0x526b48))
colorSpline.addPoint(0.9, new Color(0xab7916))
colorSpline.addPoint(1.0, new Color(0xbab3a2))
export const colorGenerator: ColorGeneratorInitializer<ThreadParams> = () => {
  return ({ height }) => {
    return colorSpline.get(remap(height, -5_000, 5_000, 0, 1))
  }
}
