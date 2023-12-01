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
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  data: { seed },
}) => {
  const terrainNoise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed,
    height: 100,
    scale: 1000,
    noiseType: NOISE_TYPES.BILLOWING,
  })

  return ({ input }) => {
    // return 0
    return terrainNoise.getFromVector(input.addScalar(10000))
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = props => {
  const color = new Color(Math.random() * 0xffffff)
  return () => {
    return color
  }
}

createThreadedFlatWorldWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
