import { randomSpherePointVector3 } from "@hello-worlds/planets"
import { cellToLatLng } from "h3-js"
import { Vector3 } from "three"

const RAD2DEG = 180 / Math.PI
const tempVector3 = new Vector3()

export function getRandomLatLong(): LatLong {
  return LatLong.cartesianToLatLong(randomSpherePointVector3(tempVector3, 100))
}

export class LatLong {
  constructor(public lat: number = 0, public lon: number = 0) {}

  static hash(lat: number, lon: number) {
    return `${lat}:${lon}`
  }

  get hash() {
    return LatLong.hash(this.lat, this.lon)
  }

  toString() {
    return this.hash
  }

  static parse(hash: string) {
    return new LatLong(...hash.split(":").map(n => parseFloat(n)))
  }

  distanceTo(other: LatLong): number {
    return Math.sqrt((this.lat - other.lat) ** 2 + (this.lon - other.lon) ** 2)
  }

  copy() {
    return new LatLong(this.lat, this.lon)
  }

  clone(latLong: LatLong) {
    this.lat = latLong.lat
    this.lon = latLong.lon
    return this
  }

  set(lat: number, lon: number) {
    this.lat = lat
    this.lon = lon
    return this
  }

  static random() {
    return getRandomLatLong()
  }

  toCartesian(radius: number, vec3: Vector3): Vector3 {
    const phi = ((90 - this.lat) * Math.PI) / 180
    const theta = ((90 - this.lon) * Math.PI) / 180

    return vec3
      .set(
        radius * Math.sin(phi) * Math.cos(theta), // x
        radius * Math.cos(phi), // y
        radius * Math.sin(phi) * Math.sin(theta), // z
      )
      .clone()
  }

  cartesianToLatLong(coordinates: Vector3): LatLong {
    const longitude = Math.atan2(coordinates.x, coordinates.z) * RAD2DEG
    const length = Math.sqrt(
      coordinates.x * coordinates.x + coordinates.z * coordinates.z,
    )
    const latitude = Math.atan2(coordinates.y, length) * RAD2DEG
    this.lat = latitude
    this.lon = longitude
    return this
  }

  static cartesianToLatLong(coordinates: Vector3): LatLong {
    const longitude = Math.atan2(coordinates.x, coordinates.z) * RAD2DEG
    const length = Math.sqrt(
      coordinates.x * coordinates.x + coordinates.z * coordinates.z,
    )
    const latitude = Math.atan2(coordinates.y, length) * RAD2DEG
    return new LatLong(latitude, longitude)
  }
}

const _tempVec3 = new Vector3()
const _tempLatLong = new LatLong()
export function getCoordinateFromHex(index: string, radius: number) {
  const ll = cellToLatLng(index)
  _tempLatLong.set(ll[0], ll[1])
  return _tempLatLong.toCartesian(radius, _tempVec3).clone()
}
