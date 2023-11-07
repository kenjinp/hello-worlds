import { random, setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedPlanetWorker,
  Noise,
  NOISE_TYPES,
  remap
} from "@hello-worlds/planets"
import { latLngToCell } from "h3-js"
import { Color, Line3, MathUtils, Vector3 } from "three"
import { LatLong } from "./tectonics/LatLong"

import { HEX_GRID_RESOLUTION, Tectonics } from "./tectonics/Tectonics"

import { BoundaryTypes } from "./tectonics/Boundary"
import Plate from "./tectonics/Plate"

export type ThreadParams = {
  size: number
  tectonics: Tectonics
  vertexUserData: Map<Vector3,any>
}
const tempLine3 = new Line3()
const tempVector3 = new Vector3()
const _tempVector3 = new Vector3()
const _tempLatLong = new LatLong()

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
  data,
  radius,
}) => {
  const { size = 4, tectonics, seed } = data;
  tectonics.plates.forEach(plate => {
    Plate.generatePolygon(plate)
  })

  console.log(tectonics)

  const warp = new Noise({
    octaves: 1,
    seed,
    height: 5000,
    scale: radius / 10,
    noiseType: NOISE_TYPES.BILLOWING,
  })

  const mountains = new Noise({
    seed: "banana",
    height: 1000000,
    scale: radius / 20,
  })

  return ({ input }) => {
    const w = warp.getFromVector(input)
    const m = mountains.get(input.x + w, input.y + w, input.z + w)
    const warpedVector = _tempVector3.copy(input).addScalar(m)

    const plate = Tectonics.getPlateFromVector3(tectonics, input)
    const [min, max] = Plate.getDistancesToPlateEdge(plate, input)
    // const min = realMin + m
    // const [wmin,wmax] = Plate.getDistancesToPlateEdge(plate, warpedVector)
    // const influence = remap(distance, 0, radius / 2, 0, 1)
    const arbitraryMaxDistanceValue = 50_000
    const distance = remap(min, 0, radius / 6, 0, arbitraryMaxDistanceValue)
  
    const alpha = remap(min, 80_000, 0, 1, 0)
    const biasedDistance = MathUtils.lerp(distance + m, distance, alpha)

    // vertexUserData.set(input, {
    //   oceanic: plate.data.oceanic
    // })

    // remap(distance, 0, 1000, 0, 1)
    return plate.data.oceanic ? -distance : distance
  }
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = ({ data: { size = 4, tectonics, seed }, radius }) => {
  const color = new Color(0x000000)
  const regionColor = new Color(0x000000)
  const oceanColor = new Color(0x07bbfc)
  const groundColor = new Color(0x9fc164)
  const tempLatLong = new LatLong()
  const warp = new Noise({
    octaves: 1,
    seed,
    height: 5000,
    scale: radius / 10,
    noiseType: NOISE_TYPES.BILLOWING,
  })

  return ({ worldPosition, data, height }) => {
    // const plate = Tectonics.getPlateFromVector3(tectonics, worldPosition)
    // const w = warp.getFromVector(worldPosition)
    // const latLong = tempLatLong.cartesianToLatLong(worldPosition)
    // const region = latLngToCell(latLong.lat, latLong.lon, HEX_GRID_RESOLUTION)
    // const isBoundary = plate.internalEdges.has(region)
    // let distance = Infinity

    // for (let line of plate.linePolygon) {
    //   distance = Math.min(
    //     line.closestPointToPoint(worldPosition, false, tempVector3).distanceTo(worldPosition),
    //   )
    // }

    // setRandomSeed(region)
    // regionColor.set(random() * 0xffffff)
    // return color.set(plate.data.color).lerp(regionColor, 0.15)
    // const endColor = plate
    //   ? plate.data.oceanic
    //     ? oceanColor
    //     : groundColor
    //   : color
    // return endColor //endColor.lerp(regionColor, 0.15)


    // const oceanOffsetColor = plate.data.oceanic ? oceanColor : groundColor

    // return oceanOffsetColor

    return height > 0 ? groundColor : oceanColor
  }
}

const edgeColorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = ({ data: { size = 4, tectonics, seed = "banana" } }) => {
  const color = new Color(0x000000)
  const regionColor = new Color(0x000000)
  const oceanColor = new Color(0x0d1b24)
  const groundColor = new Color(0x9fc164)
  const _tempLatLong = new LatLong()

  const boundaryColors = {
    [BoundaryTypes.OCEAN_COLLISION]: new Color(0x2ff3e0),
    [BoundaryTypes.SUBDUCTION]: new Color(0xf51720),
    [BoundaryTypes.SUPERDUCTION]: new Color(0xfa26a0),
    [BoundaryTypes.DIVERGING]: new Color(0xf8d210),
    [BoundaryTypes.SHEARING]: new Color(0xbd97cb),
    [BoundaryTypes.DORMANT]: new Color(0x07bb9c),
  }

  const edges = Array.from(tectonics.edges.values())

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

  return ({ worldPosition }) => {
    const plate = Tectonics.getPlateFromVector3(tectonics, worldPosition)

    const w = warp.get(worldPosition.x, worldPosition.y, worldPosition.z)
    const m = mountains.get(
      worldPosition.x + w,
      worldPosition.y + w,
      worldPosition.z + w,
    )

    const latLongOfCurrentPosition =
      _tempLatLong.cartesianToLatLong(worldPosition)

    const myEdge = edges.filter(e => {
      e.plateA.uuid === plate.uuid || e.plateB.uuid === plate.uuid
    })

    let distance = Infinity
    for (let i = 0; i < myEdge.length; i++) {
      const edge = myEdge[i]
      const boundaryPositions = Array.from(edge.boundaryPoints.keys())

      for (let j = 0; j < boundaryPositions.length; j++) {
        const llHash = boundaryPositions[j]
        const latLong = LatLong.parse(llHash)
        distance = Math.min(
          distance,
          latLongOfCurrentPosition.distanceTo(latLong) + m,
        )
      }

      // if (boundary) {
      //   return boundaryColors[boundary.type]
      // }
    }

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
