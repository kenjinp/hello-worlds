import {
  ChunkGenerator3Initializer,
  ColorGeneratorInitializer,
  Lerp,
  LinearSpline,
  Noise,
} from "@hello-worlds/planets"
import { Color } from "three"
import { DEFAULT_NOISE_PARAMS } from "../../noise/NoiseController"
import { remap } from "../WorldBuilder.math"
import { ThreadParams } from "../WorldBuilder.worker"

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ data: { seed, type }, radius }) => {
  const mountains = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blip",
    height: 20_000,
    scale: radius / 75,
  })

  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blarp",
    height: 10_000,
    scale: radius / 3,
  })

  const warp = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 8,
    seed: "apple", // <-important
    height: 10000.0,
    scale: radius / 2,
  })

  return ({ input }) => {
    const w = warp.get(input.x, input.y, input.z)
    const m = mountains.get(input.x + w, input.y + w, input.z + w)
    const n = noise.get(input.x + w, input.y + w, input.z + w)

    return n + m
  }
}

const oceanColor = new Color(0x2b65ec)

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
    return height > 0
      ? colorSpline.get(remap(height, 0, 5_000, 0, 1))
      : oceanColor
  }
}
