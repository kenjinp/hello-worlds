import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedFlatWorldWorker,
  DEFAULT_NOISE_PARAMS,
  Noise,
} from "@hello-worlds/planets"
import { Color } from "three"

export type ThreadParams = {
  seed: string
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  data: { seed },
}) => {
  const terrainNoise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed,
    height: 500,
    scale: 5000,
  })

  return ({ input }) => {
    return terrainNoise.getFromVector(input)
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = props => {
  const color = new Color(0x9fc164)
  return () => {
    return color
  }
}

createThreadedFlatWorldWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
