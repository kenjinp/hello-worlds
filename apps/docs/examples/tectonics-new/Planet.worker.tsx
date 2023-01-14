import { random, setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedPlanetWorker,
  Noise,
  NOISE_TYPES,
} from "@hello-worlds/planets"
import { latLngToCell } from "h3-js"
import { Color, Line3, Vector3 } from "three"
import { LatLong } from "./tectonics/LatLong"

import { HEX_GRID_RESOLUTION, Plate, Tectonics } from "./tectonics/Tectonics"

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
  return d
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  data: { size = 4, tectonics, seed },
  radius,
}) => {
  tectonics.plates.forEach(plate => {
    Plate.generatePolygon(plate)
  })

  console.log(tectonics)

  const warp = new Noise({
    octaves: 2,
    seed,
    height: 1000,
    scale: 3000,
    noiseType: NOISE_TYPES.BILLOWING,
  })

  const mountains = new Noise({
    seed,
    height: 2000,
    scale: 3000,
  })

  return ({ input }) => {
    const plate = Tectonics.getPlateFromVector3(tectonics, input)
    // let distance = Infinity
    // const firstPolygon = plate.polygon[0][0]
    // if (!firstPolygon) {
    //   console.warn("No polygon found!", plate.uuid)
    //   distance = 0
    // }
    // for (let i = 0; i < firstPolygon.length; i++) {
    //   const edgeVertex = firstPolygon[i]
    //   const a = polarToCartesian(edgeVertex[0], edgeVertex[1], radius)
    //   let nextEdgeVertex = firstPolygon[i + 1]
    //   if (!nextEdgeVertex) {
    //     nextEdgeVertex = firstPolygon[0]
    //   }
    //   const b = polarToCartesian(nextEdgeVertex[0], nextEdgeVertex[1], radius)
    //   const d = distanceToSegment(input, a, b)
    //   distance = Math.min(distance, d)
    // }

    // for (let i = 0; i < plate.indices.length; i++) {
    //   const boundary = cellToBoundary(plate.indices[i])
    //   for (let j = 0; j < boundary.length; j++) {
    //     const a = polarToCartesian(boundary[j][0], boundary[j][1], radius)
    //     let newBoundary = boundary[j + 1]
    //     if (!newBoundary) {
    //       newBoundary = boundary[0]
    //     }
    //     const b = polarToCartesian(newBoundary[0], newBoundary[1], radius)
    //     const d = distanceToSegment(input, a, b)
    //     distance = Math.min(distance, d)
    //   }
    // }

    // const w = warp.get(input.x, input.y, input.z)
    // const m = mountains.get(input.x + w, input.y + w, input.z + w)

    // return distance
    return plate.data.elevation * 10000
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = ({ data: { size = 4, tectonics } }) => {
  const color = new Color(0x000000)
  const regionColor = new Color(0x000000)
  const oceanColor = new Color(0x0d1b24)
  const groundColor = new Color(0x9fc164)
  const tempLatLong = new LatLong(0, 0)
  return ({ worldPosition }) => {
    const plate = Tectonics.getPlateFromVector3(tectonics, worldPosition)
    const latLong = tempLatLong.cartesianToLatLong(worldPosition)
    const region = latLngToCell(latLong.lat, latLong.lon, HEX_GRID_RESOLUTION)
    const isBoundary = plate.internalEdges.has(region)
    setRandomSeed(region)
    regionColor.set(random() * 0xffffff)
    return isBoundary
      ? color.set(0xff6666)
      : plate?.data.color
      ? color.set(plate.data.color).lerp(regionColor, 0.15)
      : color.set(0x000000)
    // return plate ? (plate.data.oceanic ? oceanColor : groundColor) : color
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
