import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
} from "@hello-worlds/planets"
import { Color } from "three"
import { terra } from "."
import { ThreadParams } from "../WorldBuilder.worker"

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = ({ data: { seaLevel }, radius }) => {
  return ({ input }) => seaLevel
}

export const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = params => {
  const {
    data: { seaLevel },
  } = params
  const oceanColor = new Color(0x1c557e)
  const oceanColorShallow = new Color(0x1df7ff)
  const h = terra.heightGenerator(params)
  return params => {
    const { input, worldPosition } = params
    const height = h(params)
    return height > seaLevel - 200 ? oceanColorShallow : oceanColor
    // return oceanColorShallow
  }
}
