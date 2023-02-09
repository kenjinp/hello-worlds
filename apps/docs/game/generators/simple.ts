import { ThreadParams } from "@game/Worker"
import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  Noise,
} from "@hello-worlds/planets"
import { Color } from "three"

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ data: { seed, type }, radius }) => {
  const noise = new Noise({
    seed: "moon",
    scale: radius / 100,
  })

  const noise2 = new Noise({
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
