import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedFlatWorldWorker,
  DEFAULT_NOISE_PARAMS,
  Noise,
  NOISE_TYPES,
} from "@hello-worlds/planets"
import { Color, MathUtils } from "three"

export type ThreadParams = {
  seed: string
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  data: { seed },
}) => {
  const warp = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 2,
    seed,
    height: 1000,
    scale: 3000,
    noiseType: NOISE_TYPES.BILLOWING,
  })

  const mountains = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed,
    height: 2000,
    scale: 3000,
  })

  return ({ input }) => {
    const w = warp.get(input.x, input.y, input.z)
    const m = mountains.get(input.x + w, input.y + w, input.z + w)
    return m
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = props => {
  const colorA = new Color(MathUtils.randFloat(0, 1) * 0xffffff)
  const color = new Color(0x9fc164)
  return () => {
    return color
  }
}

createThreadedFlatWorldWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
