import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedFlatWorldWorker,
  DEFAULT_NOISE_PARAMS,
  Noise,
  NOISE_STYLES,
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
    seed: "blip",
    height: 100,
    scale: 1000,
    noiseType: NOISE_STYLES.rigid,
  })

  const mountains = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed,
    height: 8000,
    exponentiation: 6,
    scale: 10_000,
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
  const color = new Color(MathUtils.randFloat(0, 1) * 0xffffff)
  return () => {
    return color
  }
}

createThreadedFlatWorldWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
