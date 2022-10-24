import { randomRange, setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  DEFAULT_NOISE_PARAMS,
  Noise,
} from "@hello-worlds/planets"
import { Color } from "three"
import { getRndBias, randomSpherePoint } from "../WorldBuilder.math"
import { ThreadParams } from "../WorldBuilder.worker"
import { Crater, craterHeight } from "./craters"

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ data: { seed, type }, radius }) => {
  setRandomSeed(seed)

  const craters: Crater[] = Array(700)
    .fill(0)
    .map(() => {
      const center = randomSpherePoint(0, 0, 0, radius)
      const randomRadius = getRndBias(0.005, radius / 5, 3, 0.9)
      return {
        floorHeight: randomRange(-0.05, 0),
        radius: randomRadius,
        center,
        rimWidth: randomRange(0.5, 0.9),
        rimSteepness: randomRange(0.05, 0.7),
        smoothness: randomRange(0.001, 0.03),
      }
    })

  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    height: 1000,
    seed: "craters!",
    scale: radius / 10,
  })

  const noise2 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 5,
    seed,
    height: radius,
    scale: radius * 5,
  })

  return ({ input }) => {
    const n = noise.get(input.x, input.y, input.z)
    const n2 = noise2.get(input.x, input.y, input.z)
    return n + n2 + craterHeight(input, craters)
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
