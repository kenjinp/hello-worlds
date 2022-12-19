import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  Lerp,
  LinearSpline,
  remap,
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
  const colorLerp: Lerp<THREE.Color> = (
    t: number,
    p0: THREE.Color,
    p1: THREE.Color,
  ) => {
    return p0.clone().lerp(p1, t)
  }

  const colorSpline = new LinearSpline<THREE.Color>(colorLerp)
  const oceanColorShallow = new Color(0x1df7ff)
  const oceanColorMid = new Color(0x1c557e)
  const oceanColorDeep = new Color(0x0d1b24)
  const oceanColorDeepest = new Color(0x0d1b24)
  const oceanColorDeepestest = new Color(0x02040a)

  const oceanColors: [number, Color][] = [
    [0.0, oceanColorShallow],
    [0.2, oceanColorMid],
    [0.5, oceanColorDeep],
    [0.9, oceanColorDeepest],
    [1.0, oceanColorDeepestest],
  ]
  oceanColors.forEach(([t, c]) => colorSpline.addPoint(t, c))

  const h = terra.heightGenerator(params)
  return params => {
    // TODO we should NOT mutate the input position, or name it something else?
    params.input.z = params.worldPosition.z
    const groundHeight = h(params)
    const depth = seaLevel - groundHeight
    const underWater = depth > 0
    return underWater
      ? colorSpline.get(remap(depth, 0, 3_000, 0, 1))
      : oceanColorShallow
  }
}
