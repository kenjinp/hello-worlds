import { ChunkGenerator3Initializer, Noise, remap } from "@hello-worlds/planets"
import { Color, MathUtils, Vector3 } from "three"
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

export const tectonicHeightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number,
  { tectonics: Tectonics }
> = ({ radius, data: { tectonics } }) => {
  const noise = new Noise({
    height: 1000,
    scale: radius / 100,
    seed: "plate tectonics",
  })

  return ({ input, radius }) => {
    const n = noise.getFromVector(input)
    let plateRegion = Tectonics.findPlateFromCartesian(tectonics, input, hNext)!
    plateRegion.plate.edges
    // for this point,
    // find the edge of the plate that is closest
    // and use that to determine the height
    const neighbors = plateRegion.region.properties.neighbors
    const increment = 250

    let maxDistance = round(
      input.distanceTo(plateRegion.region.properties.siteXYZ) + n,
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
            tempVector3
              .copy(neighborRegion.properties.siteXYZ)
              .distanceTo(input) + n,
            increment,
            0,
          ),
          distance,
        )
      }
    }
    return remap(distance, 0, maxDistance, 0, 10000)
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
