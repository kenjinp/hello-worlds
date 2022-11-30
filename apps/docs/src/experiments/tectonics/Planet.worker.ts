import {
  ChunkGenerator3Initializer,
  createThreadedPlanetWorker,
  Lerp,
  LinearSpline,
  Noise,
} from "@hello-worlds/planets"
import { Color, Vector3 } from "three"
import { BoundaryTypes, Edge } from "./tectonics/Edge"
import { Tectonics } from "./tectonics/Tectonics"
import { remap } from "./tectonics/utils"

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
let tectonics: Tectonics

// DONT USE MATH.POW!
function calculateSubductionElevation(
  distance: number,
  magnitude: number,
  exponential: number = 0.8,
  modifier: number = 100,
) {
  // const absDistance = Math.abs(distance);
  // const powValue = Math.pow(absDistance, exponential);
  // const mountainHeight = (100 * Math.sin(distance)) / distance;
  // return Math.max(mountainHeight, 0);
  return 0.001
}

function calculateMountainElevation(
  distance: number,
  // magnitude: number,
  width: number = 0.8,
  height: number = 100,
  minPossibleHeight: number = 0,
) {
  // const absDistance = Math.abs(distance);
  // const powValue = Math.pow(absDistance, exponential);
  // const mountainHeight = (100 * Math.sin(distance)) / distance;
  // return Math.max(mountainHeight, 0);
  return Math.max(-Math.abs(distance * width) + height, minPossibleHeight)
}

const tectonicHeightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number,
  { tectonics: Tectonics }
> = ({ radius, data: { tectonics: mainTectonics } }) => {
  const noise = new Noise({
    seed: "banana", // <-important
    height: 1.0,
    scale: radius / 5,
  })

  const mountainNoise2 = new Noise({
    octaves: 5,
    seed: "kiwi", // <-important
    height: 10,
    scale: radius / 2,
  })

  const mountainNoise = new Noise({
    octaves: 3,
    seed: "apple", // <-important
    height: 10000.0,
    scale: radius,
  })

  let closestEdge: Edge
  let closestEdgeDistance: number = Number.MAX_SAFE_INTEGER

  return ({ input, radius }) => {
    if (!tectonics && mainTectonics) {
      tectonics = mainTectonics
    }

    const x = mountainNoise2.get(input.x, input.y, input.z)
    const m = mountainNoise.get(input.x * x, input.y * x, input.z * x)
    const n = noise.get(input.x + m, input.y + m, input.z + m) // warped

    const calculateMountainElevation = (
      distance: number,
      mag: number,
      distLerp: number,
    ) => {
      // const val = Math.sqrt(100*100-distance*distance)
      return (
        (Math.max(-Math.abs(distance * 0.05) + 1000 * mag, 0) * n * 10) / mag
      )
      // return Number.isNaN(val) ? 0.0001: val * n;
    }

    let plateRegion = Tectonics.findPlateFromCartesian(tectonics, input, hNext)!
    // let elevation = plateRegion.plate.elevation;
    // elevation *= n;
    // let elevation = plateRegion.plate.elevation;
    let elevation = plateRegion.plate.oceanic
      ? plateRegion.plate.elevation
      : remap(
          m,
          plateRegion.plate.elevation,
          1000,
          plateRegion.plate.elevation,
          50,
        )
    let boundaryDistanceElevation = 0

    // plateRegion.plate.elevation;
    // plateRegion.plate.neighbors.forEach()

    // const edgeArray = Array.from(tectonics.edges.values());
    const edgeArray = plateRegion.plate.edges
    for (let e = 0; e < edgeArray.length; e++) {
      const edge = edgeArray[e]
      for (let c = 0; c < edge.coordinates.length; c++) {
        const coord = edge.coordinates[c]
        const distance = input.distanceTo(coord.coordinate)
        // ignore very far away edges
        if (distance >= 1000 * (n * 1.5)) {
          continue
        }
        const neighborPlate = tectonics.plates.get(coord.neighborPlateIndex)!
        const currentPlate = tectonics.plates.get(coord.regionPlateIndex)!
        if (neighborPlate.index === currentPlate.index) {
          throw Error("Oh no")
        }

        if (!closestEdge || distance < closestEdgeDistance) {
          closestEdge = edge
          closestEdgeDistance = distance
        }

        const sorted = [neighborPlate.elevation, currentPlate.elevation].sort()
        const distLerpVal = Math.max(-Math.abs(distance) + 100, 0)
        const remappedDistLerpVal = remap(distLerpVal, 0, 100, 0, 1) // elevation = Math.max(distance, elevation);
        // boundaryDistanceElevation = Math.max(remappedDistLerpVal, boundaryDistanceElevation);
        // elevation = Math.min(MathUtils.lerp(sorted[1], sorted[0], remappedDistLerpVal), elevation);
        // elevation += lerp(sorted[1], sorted[0], remappedDistLerpVal * n)
        elevation = Math.max(Math.max(sorted[0], sorted[1]), elevation)
        // elevation = remappedDistLerpVal
        // elevation = Math.max(lerp(elevation, elevation * n, remappedDistLerpVal))
        if (
          coord.boundaryType === BoundaryTypes.SUBDUCTION ||
          coord.boundaryType === BoundaryTypes.SUPERDUCTION ||
          coord.boundaryType === BoundaryTypes.OCEAN_COLLISION
        ) {
          // This is bad, distanceTo is expensive
          // const distance = input.distanceTo(coord.coordinate);
          const magnitude = coord.elevation
          const modifier = calculateMountainElevation(
            distance,
            magnitude,
            n,
            // // magnitude,
            // subductionConstants.exponential,
            // // Math.max(-coord.pressure + 1, 0.78),
            // subductionConstants.modifier,
          )
          elevation = Math.max(elevation, modifier)
          // subductionElevation += modifier * magnitude;
        }
        if (coord.boundaryType === BoundaryTypes.DIVERGING) {
          // const distance = input.distanceTo(coord.coordinate);
          const magnitude = coord.elevation
          // const modifier = calculateMountainElevation(
          //   distance,
          //   magnitude,
          //   remappedDistLerpVal,
          //   // Math.max(-coord.pressure + 1, 0.78),
          //   subductionConstants.modifier,
          //   plateRegion.plate.elevation
          // );
          // elevation = Math.max(elevation, modifier);
        }
      }
    }
    // tectonics.edges.forEach((edge) => {
    //   edge.coordinates.forEach((coord) => {
    //     coord.boundaryType === BoundaryTypes.SUBDUCTION ||
    //       coord.boundaryType === BoundaryTypes.SUPERDUCTION;
    //     const distance = input.distanceTo(coord.coordinate);
    //     elevation += subductionFn(distance);
    //   });
    // });
    // return MathUtils.lerp(noise.get(input.x, input.y, input.z) elevation
    // return subductionElevation ? subductionElevation + elevation : elevation;
    // return lerp(boundaryDistanceElevation, elevation * n, n);
    return elevation
  }
}

// const testMountainHeight: ChunkGenerator3<ThreadParams, number> = {
//   // maybe we can use this as a base for an ocean
//   get({
//     input,
//     data: { tectonics, subductionConstants, randomTestPoint },
//     radius,
//   }) {
//     let elevation = 0;
//     const distance = input.distanceTo(randomTestPoint);
//     const magnitude = 1;
//     const modifier = calculateSubductionElevation(
//       distance,
//       magnitude,
//       subductionConstants.exponential,
//       subductionConstants.modifier
//     );
//     elevation += modifier + noise.get(input.x, input.y, input.z) * 0.5;
//     return elevation;
//   },
// };

// const PlateMovementHeightGenerator: ChunkGenerator3<ThreadParams, number> = {
//   get({ input, data: { tectonics }, radius }) {
//     const finding = Tectonics.findPlateFromCartesian(tectonics, input, hNext);
//     if (finding) {
//       const { plate, region } = finding;
//       const movement = Plate.calculateMovement(
//         plate,
//         tempVector3.copy(region.properties.siteXYZ).clone(),
//         tempVector3.clone()
//       );
//       return movement.length();
//     }
//     return 0;
//   },
// };

// const PlateElevationHeightGenerator: ChunkGenerator3<ThreadParams, number> = {
//   get({ input, data: { tectonics }, radius }) {
//     const finding = Tectonics.findPlateFromCartesian(tectonics, input, hNext);
//     if (finding) {
//       const { plate, region } = finding;
//       return plate.elevation;
//     }
//     return 0;
//   },
// };

let cNext: number | undefined = undefined

const colorLerp: Lerp<THREE.Color> = (
  t: number,
  p0: THREE.Color,
  p1: THREE.Color,
) => {
  const c = p0.clone()
  return c.lerp(p1, t)
}

const colorSplines = [
  new LinearSpline<THREE.Color>(colorLerp),
  new LinearSpline<THREE.Color>(colorLerp),
  new LinearSpline<THREE.Color>(colorLerp),
]

// Temp / Aridity
colorSplines[0].addPoint(0.0, new Color(0x37a726))
colorSplines[0].addPoint(0.05, new Color(0x214711))
colorSplines[0].addPoint(0.4, new Color(0x526b48))
colorSplines[0].addPoint(0.9, new Color(0xab7916))
colorSplines[0].addPoint(1.0, new Color(0xbab3a2))

// Humid
// colorSplines[1].addPoint(0.0, new THREE.Color(this.params.humidLow));
// colorSplines[1].addPoint(0.5, new THREE.Color(this.params.humidMid));
// colorSplines[1].addPoint(1.0, new THREE.Color(this.params.humidHigh));

// sea
colorSplines[2].addPoint(0, new Color(0x10313e))
colorSplines[2].addPoint(0.98, new Color(0x1d5a67))
colorSplines[2].addPoint(0.995, new Color(0x469280))

const colorGenerator: ChunkGenerator3Initializer<ThreadParams, Color> = ({
  data: { seaLevel },
}) => {
  const chunkColor = new Color(Math.random() * 0xffffff)
  return ({ input, worldPosition, radius }) => {
    const height = input.z
    // return chunkColor;

    // if (finding) {
    //   return finding.plate.color
    //   // return finding.plate.oceanic ? oceanColor : groundColor;
    // }
    // return noColor;
    // return chunkColor.clone().setRGB(height, height, height);

    if (height < seaLevel) {
      if (height < -50) {
        return new Color(0x10313e)
      }
      // return tempColor.clone().setRGB(0, 0, -height);
      return colorSplines[2].get(remap(height, -50, 0, 0, 1))
    }

    const finding = Tectonics.findPlateFromCartesian(
      tectonics,
      worldPosition,
      cNext,
    )
    const regionIndex = finding?.region.properties.index
    if (!regionIndex) {
      const c1 = colorSplines[0].get(remap(seaLevel + height, 0, 100, 0, 1))
      return c1
    }

    // const color = chunkColor.set(seededRandom(finding?.region.properties.index) * 0xffffff);
    // return color;
    return finding.plate.color

    // const c1 = colorSplines[0].get(remap(seaLevel + height, 0, 100, 0, 1));
    // return c1;
    // const c2 = colorSplines[1].get(h);

    // return c1.lerp(c2, 1);
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: tectonicHeightGenerator,
  colorGenerator,
})
