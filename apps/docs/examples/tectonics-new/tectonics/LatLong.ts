import { randomSpherePointVector3 } from "@hello-worlds/planets"
import { Vector3 } from "three"

const RAD2DEG = 180 / Math.PI
const tempVector3 = new Vector3()
export function getRandomLatLong(): LatLong {
  return LatLong.cartesianToLatLong(randomSpherePointVector3(tempVector3, 100))

  // // Generate a random latitude between -90 and 90
  // const latitude = random() * 180 - 90

  // // Generate a random longitude between -180 and 180
  // const longitude = random() * 360 - 180

  // return new LatLong(latitude, longitude)
}

export class LatLong {
  constructor(public lat: number, public lon: number) {}

  distanceTo(other: LatLong): number {
    return Math.sqrt((this.lat - other.lat) ** 2 + (this.lon - other.lon) ** 2)
  }

  copy() {
    return new LatLong(this.lat, this.lon)
  }

  clone(latLong: LatLong) {
    this.lat = latLong.lat
    this.lon = latLong.lon
  }

  set(lat: number, lon: number) {
    this.lat = lat
    this.lon = lon
  }

  static random() {
    return getRandomLatLong()
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
