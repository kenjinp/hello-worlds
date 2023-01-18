import { cellsToMultiPolygon } from "h3-js"
import { Line3, MathUtils, Vector3 } from "three"
import { LatLong } from "./LatLong"

export const HEX_GRID_RESOLUTION = 3

export class PlateBoundary {
  constructor(public readonly plateA: Plate, public readonly plateB: Plate) {}
}

const _tempVec3 = new Vector3()
const _tempLatLong = new LatLong()

export default class Plate<T = any> {
  neighbors = new Set<string>()
  name: string
  indices = new Set<string>()
  uuid = MathUtils.generateUUID()
  polygon: LatLong[] = []
  linePolygon: Line3[] = []
  externalEdges = new Set<string>()
  internalEdges = new Set<string>()
  constructor(public readonly origin: LatLong, public data: T) {
    // Plate.generatePolygon(this)
  }
  static generatePolygon(plate: Plate): void {
    plate.linePolygon = []
    plate.polygon = []
    const vec3s = []
    const polygon = cellsToMultiPolygon(Array.from(plate.indices))
    const latLongs = polygon[0][0]

    if (!latLongs?.length) {
      console.warn("no latlongs for plate", plate, polygon)
      return
    }

    for (const latLong of latLongs) {
      _tempLatLong.set(latLong[0], latLong[1])
      plate.polygon.push(_tempLatLong.clone())

      vec3s.push(_tempLatLong.toCartesian(plate.data.radius, _tempVec3))
    }

    for (let i = 0; i < vec3s.length; i++) {
      const a = vec3s[i]
      let b = vec3s[i + 1]
      if (!b) {
        b = vec3s[0]
      }
      plate.linePolygon.push(new Line3(a, b))
    }
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
