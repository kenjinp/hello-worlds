import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedRingWorldWorker,
  Noise,
} from "@hello-worlds/planets"
import { Color } from "three"
import { DEFAULT_NOISE_PARAMS } from "../noise/NoiseController"
import { terra } from "./generators"
import { PlANET_TYPES } from "./WorldBuilder.state"

export type ThreadParams = {
  seed: string
  type: PlANET_TYPES
}

const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = props => {
  const mountains = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blip",
    height: 1000,
    scale: 1_000 / 75,
  })

  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blarp",
    height: 2_000,
    scale: 1_000 / 3,
  })

  const warp = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 8,
    seed: "apple", // <-important
    height: 3000.0,
    scale: 1_000 / 2,
  })

  return ({ input }) => {
    const w = warp.get(input.x, input.y, input.z)
    const m = mountains.get(input.x + w, input.y + w, input.z + w)
    const n = noise.get(input.x + w, input.y + w, input.z + w)

    // return n + m
    return 1
  }
}
const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = props => {
  // const {
  //   data: { type },
  // // } = props
  // const color = new Color(Math.random() * 0xffffff)
  // return () => {
  //   return color
  // }
  return terra.colorGenerator(props)
}

createThreadedRingWorldWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
