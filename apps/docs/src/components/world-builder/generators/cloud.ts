import {
  ChunkGenerator3Initializer,
  DEFAULT_NOISE_PARAMS,
  Noise,
} from "@hello-worlds/planets"
import { Color } from "three"
import { InitialData } from "../WorldBuilder.worker"

export const heightGenerator: ChunkGenerator3Initializer<
  {},
  number,
  InitialData
> = ({ initialData: { seed, type }, radius }) => {
  return ({ input }) => 1
}

export const colorGenerator: ChunkGenerator3Initializer<
  {},
  Color,
  InitialData
> = ({ initialData: { seed, type }, radius }) => {
  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    height: 1,
    octaves: 5,
    seed,
    scale: radius / 100,
  })

  const noise2 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 12,
    seed,
    height: 1,
    scale: radius / 10,
  })

  const noise3 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
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
