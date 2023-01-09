import { polarToCartesian } from "@examples/tectonics/voronoi/math"
import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedPlanetWorker,
} from "@hello-worlds/planets"
import { Color, Line3, Vector3 } from "three"

import { Plate, Tectonics } from "./tectonics/Tectonics"

export type ThreadParams = {
  size: number
  tectonics: Tectonics
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
  data: { size = 4, tectonics },
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

  console.log("plate", Plate.polygon(Object.values(tectonics.plates)[0]))

  return ({ input }) => {
    const plate = Tectonics.getPlateFromVector3(tectonics, input)
    let distance = Infinity
    if (plate) {
      const polygon = Plate.polygon(plate)

      // for (let i = 0; i < hexBoundary.length; i++) {
      //   const hexBoundaryPoint = hexBoundary[i]

      //   const a = polarToCartesian(
      //     hexBoundaryPoint[0],
      //     hexBoundaryPoint[1],
      //     radius,
      //   )

      //   let next = hexBoundary[i + 1]

      //   if (!next) {
      //     next = hexBoundary[0]
      //   }

      //   let b = polarToCartesian(next[0], next[1], radius)

      //   let d = distanceToSegment(input, a, b)
      //   distance = Math.min(distance, d)
      // }
      const blah = polarToCartesian(
        plate.origin.lat,
        plate.origin.lon,
        radius,
      ).distanceTo(input)

      if (!Number.isNaN(blah)) {
        distance = blah
      } else {
        distance = 0
      }
    } else {
      distance = 0
      // const longLat = cartesianToPolar(input)

      // const h3Index = latLngToCell(longLat[1], longLat[0], size)

      // // Get the vertices of the hexagon
      // const hexBoundary = cellToBoundary(h3Index)
      // for (let i = 0; i < hexBoundary.length; i++) {
      //   const hexBoundaryPoint = hexBoundary[i]

      //   const a = polarToCartesian(
      //     hexBoundaryPoint[0],
      //     hexBoundaryPoint[1],
      //     radius,
      //   )

      //   let next = hexBoundary[i + 1]

      //   if (!next) {
      //     next = hexBoundary[0]
      //   }

      //   let b = polarToCartesian(next[0], next[1], radius)

      //   let d = distanceToSegment(input, a, b)
      //   distance = Math.min(distance, d)
      // }
    }

    return distance
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = ({ data: { size = 4, tectonics } }) => {
  console.log({ tectonics })
  const color = new Color(0x9fc164)
  return ({ worldPosition }) => {
    const plate = Tectonics.getPlateFromVector3(tectonics, worldPosition)
    return plate.color ? plate.color : color.set(0x000000)
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
