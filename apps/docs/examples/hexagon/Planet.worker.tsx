import {
  cartesianToPolar,
  polarToCartesian,
} from "@examples/tectonics/voronoi/math"
import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedPlanetWorker,
} from "@hello-worlds/planets"
import { Color, Line3, MathUtils, Vector3 } from "three"

import { random, setRandomSeed } from "@hello-worlds/core"
import { cellToBoundary, latLngToCell } from "h3-js"

export type ThreadParams = {
  size: number
}
const tempLine3 = new Line3()
const tempVector3 = new Vector3()

function round(number, increment, offset) {
  return Math.ceil((number - offset) / increment) * increment + offset
}
const distanceToSegment = (position: Vector3, a: Vector3, b: Vector3) => {
  const line = tempLine3.set(a, b)
  const d = line
    .closestPointToPoint(position, false, tempVector3)
    .distanceTo(position)

  if (Number.isNaN(d)) {
    throw new Error("NaN distance")
  }

  return d
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  data: { size = 4 },
  radius,
}) => {
  // const warp = new Noise({
  //   ...DEFAULT_NOISE_PARAMS,
  //   octaves: 2,
  //   seed,
  //   height: 1000,
  //   scale: 3000,
  //   noiseType: NOISE_TYPES.BILLOWING,
  // })

  // const mountains = new Noise({
  //   ...DEFAULT_NOISE_PARAMS,
  //   seed,
  //   height: 2000,
  //   scale: 3000,
  // })

  return ({ input }) => {
    const longLat = cartesianToPolar(input)

    const h3Index = latLngToCell(longLat[1], longLat[0], size)

    // Get the vertices of the hexagon
    const hexBoundary = cellToBoundary(h3Index)
    let distance = Infinity
    for (let i = 0; i < hexBoundary.length; i++) {
      const hexBoundaryPoint = hexBoundary[i]

      const a = polarToCartesian(
        hexBoundaryPoint[0],
        hexBoundaryPoint[1],
        radius,
      )

      let next = hexBoundary[i + 1]

      if (!next) {
        next = hexBoundary[0]
      }

      let b = polarToCartesian(next[0], next[1], radius)

      let d = distanceToSegment(input, a, b)
      distance = Math.min(distance, d)
    }
    return distance
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = ({ data: { size = 4 } }) => {
  const colorA = new Color(MathUtils.randFloat(0, 1) * 0xffffff)
  const color = new Color(0x9fc164)
  return ({ worldPosition }) => {
    const longLat = cartesianToPolar(worldPosition)

    const h3Index = latLngToCell(longLat[1], longLat[0], size)
    setRandomSeed(h3Index)
    return color.set(random() * 0xffffff)
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
