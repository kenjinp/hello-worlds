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
  return ({ input }) => 1
}

export const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = ({ data, radius }) => {
  const seed = "banana"
  const noise = new Noise({
    height: 1,
    octaves: 5,
    seed,
    scale: radius / 100,
  })

  const noise2 = new Noise({
    octaves: 12,
    seed,
    height: 1,
    scale: radius / 10,
  })

  const noise3 = new Noise({
    seed,
    height: 1,
    scale: radius / 4,
  })

  return ({ input, worldPosition }) => {
    const n = Math.abs(
      noise.get(worldPosition.x, worldPosition.y, worldPosition.z),
    )

    const n2 = noise2.get(
      worldPosition.x * n,
      worldPosition.y * n,
      worldPosition.z * n,
    )
    const n3 = noise3.get(
      worldPosition.x + n,
      worldPosition.y + n,
      worldPosition.z + n,
    )
    // return white.multiplyScalar(n)
    // const w = worldPosition.clone().normalize()
    return [n2, n2, n2, n2]
    // return [n3, n3, n3, n3]
  }
}
