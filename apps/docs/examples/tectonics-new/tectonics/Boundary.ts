import { Vector3 } from "three"
import Edge from "./Edge"
import { LatLong } from "./LatLong"

const BOUNDARY_CONST = 0.3

export function vectorTo(pos1: Vector3, pos2: Vector3) {
  return pos1.clone().sub(pos2)
}

export function calculateRelativeMotionOnVertex(
  movementA: Vector3,
  movementB: Vector3,
) {
  return movementA.clone().sub(movementB)
}

export function calculateStressOnEdge(
  movementA: Vector3,
  movementB: Vector3,
  boundaryVector: Vector3,
  boundaryNormal: Vector3,
) {
  const relativeMovement = movementA.clone().sub(movementB)
  const pressureVector = relativeMovement
    .clone()
    .projectOnVector(boundaryNormal)
  let pressure = pressureVector.length()
  if (pressureVector.dot(boundaryNormal) > 0) pressure = -pressure
  const shear = relativeMovement
    .clone()
    .projectOnVector(boundaryVector)
    .length()
  return {
    pressure: 2 / (1 + Math.exp(-pressure / 30)) - 1,
    shear: 2 / (1 + Math.exp(-shear / 30)) - 1,
  }
}

export enum BoundaryTypes {
  OCEAN_COLLISION = "OCEAN_COLLISION",
  SUBDUCTION = "SUBDUCTION",
  SUPERDUCTION = "SUPERDUCTION",
  DIVERGING = "DIVERGING",
  SHEARING = "SHEARING",
  DORMANT = "DORMANT",
}

export default class BoundaryPoint {
  elevation: number
  pressure: number
  shear: number
  boundaryType: BoundaryTypes
  vertex: Vector3
  constructor(public readonly edge: Edge, public readonly latLong: LatLong) {
    const plateA = this.edge.plateA
    const plateB = this.edge.plateB
    this.vertex = this.latLong.toCartesian(plateA.data.radius, new Vector3())

    const movementPlateA = plateA.calculateMovement(this.vertex)
    const movementPlateB = plateB.calculateMovement(this.vertex)
    const boundaryNormal = vectorTo(movementPlateA, this.vertex)
    const boundaryVector = boundaryNormal.cross(this.vertex)

    const { pressure, shear } = calculateStressOnEdge(
      movementPlateA,
      movementPlateB,
      boundaryVector,
      boundaryNormal,
    )

    let boundaryType = BoundaryTypes.DORMANT
    this.boundaryType = boundaryType
    this.pressure = pressure
    this.shear = shear
    let elevation = plateA.data.elevation

    if (pressure > BOUNDARY_CONST) {
      elevation =
        Math.max(plateA.data.elevation, plateB.data.elevation) + pressure

      if (plateA.data.oceanic && plateB.data.oceanic) {
        // calculateElevation = calculateCollidingElevation;
        // oceanCollision
        boundaryType = BoundaryTypes.OCEAN_COLLISION
      } else if (plateB.data.oceanic) {
        // subduction
        // tectonicBoundaryType.copy(tectonicTypeColorMap.subduction);
        boundaryType = BoundaryTypes.SUBDUCTION
      } else {
        // superduction
        // tectonicBoundaryType.copy(tectonicTypeColorMap.superduction);
        boundaryType = BoundaryTypes.SUPERDUCTION
      }
    } else if (pressure < -BOUNDARY_CONST) {
      elevation =
        Math.max(plateA.data.oceanic, plateB.data.oceanic) - pressure / 4
      // calculateElevation = calculateDivergingElevation;
      // diverging elevation
      // tectonicBoundaryType.copy(tectonicTypeColorMap.diverging);
      boundaryType = BoundaryTypes.DIVERGING
    } else if (shear > BOUNDARY_CONST) {
      elevation =
        Math.max(plateA.data.elevation, plateB.data.elevation) + shear / 8
      // calculateElevation = calculateShearingElevation;
      // shearing elevation
      // tectonicBoundaryType.copy(tectonicTypeColorMap.shearing);
      boundaryType = BoundaryTypes.SHEARING
    } else {
      elevation = (plateA.data.elevation + plateB.data.elevation) / 2
      // calculateElevation = calculateDormantElevation;
      // Dormant Elevation
      // tectonicBoundaryType.copy(tectonicTypeColorMap.dormant);
      boundaryType = BoundaryTypes.DORMANT
    }

    this.elevation = elevation
  }
}
