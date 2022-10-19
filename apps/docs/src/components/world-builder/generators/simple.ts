import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  DEFAULT_NOISE_PARAMS,
  Noise,
} from "@hello-worlds/planets"
import { Color } from "three"
import { ThreadParams } from "../WorldBuilder.worker"

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ data: { seed, type }, radius }) => {
  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "moon",
    scale: radius / 100,
  })

  const noise2 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 3,
    seed: "blerp",
    height: 1000,
    scale: radius / 10,
  })

  return ({ input }) => {
    const n = noise.get(input.x, input.y, input.z)
    const n2 = noise2.get(input.x, input.y, input.z)
    return n * n2
  }
}

const moonColor = new Color(0x332e36)
export const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = () => {
  return ({ input }) => {
    return moonColor
  }
}
