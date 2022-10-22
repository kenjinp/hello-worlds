import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedRingWorldWorker,
  Noise
} from "@hello-worlds/planets"
import { Color, MathUtils } from "three"
import { DEFAULT_NOISE_PARAMS } from "../noise/NoiseController"
import { terra } from "./generators"
import { PlANET_TYPES } from "./WorldBuilder.state"

export type ThreadParams = {
  seed: string
  type: PlANET_TYPES
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  radius,
  length,
}) => {
  const warp = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 2,
    seed: "blip",
    height: 100,
    scale: 200,
  })

  const mountains = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blip",
    height: 1000,
    scale: 1000,
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
  // return () => {
  //   return color
  // }
  return terra.colorGenerator(props)
}

createThreadedRingWorldWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
