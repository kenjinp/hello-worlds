import { ChunkGenerator3Initializer, Noise, remap } from "@hello-worlds/planets"
import { Color, Line3, MathUtils, Vector3 } from "three"
import { Tectonics } from "./tectonics/Tectonics"

// We're not doing anything with this yet
export type ThreadParams = {
  tectonics?: Tectonics
  seaLevel: number
  subductionConstants: {
    exponential: number
    modifier: number
  }
  randomTestPoint: Vector3
}

const tempVector3 = new Vector3()
let hNext: number | undefined = undefined

function round(number, increment, offset) {
  return Math.ceil((number - offset) / increment) * increment + offset
}

const tempLine3 = new Line3()

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

// // Create the DistanceToPolygonEdge function
// const distanceToPolygonEdge = (point: Vector3, polygon) => {
//   // Initialize the minimum distance to Infinity
//   let minDistance = Infinity

//   // Loop through the polygon points to find the
//   // edge that is closest to the given point.
//   for (let i = 0; i < polygon.length; i++) {
//     // Get the current and next points in the polygon.
//     const currentPoint = polygon[i]
//     const nextPoint = polygon[(i + 1) % polygon.length]

//     // Calculate the distance from the given point
//     // to the edge formed by the current and next
//     // points in the polygon.
//     const distance = point.distanceToSegment(currentPoint, nextPoint)

//     // If the calculated distance is smaller than
//     // the current minimum distance, update the
//     // minimum distance with the new value.
//     if (distance < minDistance) {
//       minDistance = distance
//     }
//   }

//   // Return the minimum distance to the edge of
//   // the polygon.
//   return minDistance
// }

const getElevationStepVoronoi = (tectonics: Tectonics, input: Vector3) => {
  let plateRegion = Tectonics.findPlateFromCartesian(tectonics, input, hNext)!
  plateRegion.plate.edges
  // for this point,
  // find the edge of the plate that is closest
  // and use that to determine the height
  const neighbors = plateRegion.region.properties.neighbors
  const increment = 250

  let maxDistance = round(
    input.distanceTo(plateRegion.region.properties.siteXYZ),
    increment,
    0,
  )
  let distance = maxDistance

  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i]
    const neighborRegion = tectonics.voronoiSphere.regions[neighbor]
    if (neighborRegion) {
      distance = Math.min(
        round(
          tempVector3.copy(neighborRegion.properties.siteXYZ).distanceTo(input),
          increment,
          0,
        ),
        distance,
      )
    }
  }
  return remap(distance, 0, maxDistance, 0, 10)
}

const getEdgeDistance = (tectonics: Tectonics, input: Vector3) => {
  let plateRegion = Tectonics.findPlateFromCartesian(tectonics, input, hNext)!
  plateRegion.region.geometry.vertices
  let distance = Infinity

  for (
    let i = 0;
    i < plateRegion.region.geometry.polygonEdgePoints.length - 1;
    i++
  ) {
    const a = tempVector3
      .copy(plateRegion.region.geometry.polygonEdgePoints[i])
      .clone()
    let b: Vector3

    b = tempVector3
      .copy(plateRegion.region.geometry.polygonEdgePoints[i + 1])
      .clone()
    let d = distanceToSegment(input, a, b)

    distance = Math.min(d, distance)
  }

  return distance
}

export const tectonicHeightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number,
  { tectonics: Tectonics }
> = ({ radius, data: { tectonics } }) => {
  const noise = new Noise({
    height: 500,
    scale: radius / 100,
    seed: "plate tectonics",
  })

  return ({ input, radius }) => {
    // const n = noise.getFromVector(input)
    let plateRegion = Tectonics.findPlateFromCartesian(tectonics, input, hNext)!
    let distance = Infinity

    for (let i = 0; i < plateRegion.plate.edges.length; i++) {
      const edge = plateRegion.plate.edges[i]
      for (let j = 0; j < edge.coordinates.length; j++) {
        const coordinate = edge.coordinates[j]
        const a = tempVector3.copy(coordinate.coordinate).clone()
        let b: Vector3

        const next = edge.coordinates[j + 1]
        if (!next) {
          break
        }
        b = tempVector3.copy(edge.coordinates[j + 1].coordinate).clone()
        let d = distanceToSegment(input, a, b)

        distance = Math.min(d, distance)
      }
    }

    return distance
  }
}

let cNext: number | undefined = undefined

const regionColors: {
  [index: number]: Color
} = {}

export const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color
> = ({ data: { seaLevel, tectonics } }) => {
  const chunkColor = new Color(Math.random() * 0xffffff)
  return ({ input, worldPosition, radius }) => {
    const finding = Tectonics.findPlateFromCartesian(
      tectonics,
      worldPosition,
      cNext,
    )
    const regionIndex = finding?.region.properties.index
    if (!regionIndex) {
      return chunkColor
    }

    if (!regionColors[regionIndex]) {
      regionColors[regionIndex] = new Color(
        MathUtils.seededRandom(regionIndex) * 0xffffff,
      )
    }

    return regionColors[regionIndex]
  }
}

export const plateColor: ChunkGenerator3Initializer<ThreadParams, Color> = ({
  data: { seaLevel, tectonics },
}) => {
  // const chunkColor = new Color(Math.random() * 0xffffff)
  return ({ input, worldPosition, radius }) => {
    const finding = Tectonics.findPlateFromCartesian(
      tectonics,
      worldPosition,
      cNext,
    )

    return finding.plate.color
    // const regionIndex = finding?.region.properties.index
    // if (!regionIndex) {
    //   return chunkColor
    // }

    // if (!regionColors[regionIndex]) {
    //   regionColors[regionIndex] = new Color(
    //     MathUtils.seededRandom(regionIndex) * 0xffffff,
    //   )
    // }

    // return regionColors[regionIndex]
  }
}
