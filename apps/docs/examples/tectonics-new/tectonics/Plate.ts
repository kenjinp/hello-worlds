import { cellsToMultiPolygon, CoordPair } from "h3-js"
import { MathUtils, Vector3 } from "three"
import { LatLong } from "./LatLong"

export const HEX_GRID_RESOLUTION = 3

export class PlateBoundary {
  constructor(public readonly plateA: Plate, public readonly plateB: Plate) {}
}

const _tempVec3 = new Vector3()

export default class Plate<T = any> {
  neighbors = new Set<string>()
  name: string
  indices = new Set<string>()
  uuid = MathUtils.generateUUID()
  polygon: CoordPair[][][]
  externalEdges = new Set<string>()
  internalEdges = new Set<string>()
  constructor(public readonly origin: LatLong, public data: T) {
    // console.log(cellsToMultiPolygon(hexagons, true))
  }
  static generatePolygon(plate: Plate) {
    plate.polygon = cellsToMultiPolygon(Array.from(plate.indices))
  }
  calculateMovement(position: Vector3) {
    const originPosition = this.origin.toCartesian(this.data.radius, _tempVec3)
    const movement = this.data.driftAxis
      .clone()
      .cross(position)
      .setLength(
        this.data.driftRate *
          position
            .clone()
            .projectOnVector(this.data.driftAxis)
            .distanceTo(position),
      )
    movement.add(
      originPosition
        .clone()
        .cross(position)
        .setLength(
          this.data.spinRate *
            position
              .clone()
              .projectOnVector(originPosition)
              .distanceTo(position),
        ),
    )
    return movement as Vector3
  }
}
