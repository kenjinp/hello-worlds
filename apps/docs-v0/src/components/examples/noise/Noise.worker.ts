import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedFlatWorldWorker,
  DEFAULT_NOISE_PARAMS,
  Noise,
  NOISE_TYPES,
} from "@hello-worlds/planets"
import { Color } from "three"

export type ThreadParams = {
  seed: string
  noiseType: NOISE_TYPES
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  data: { seed, noiseType },
}) => {
  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed,
    noiseType,
  })

  return ({ input }) => {
    const n = noise.get(input.x, input.y, input.z)
    return n
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = () => {
  const color = new Color(0x9fc164)
  return () => {
    return color
  }
}

createThreadedFlatWorldWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
