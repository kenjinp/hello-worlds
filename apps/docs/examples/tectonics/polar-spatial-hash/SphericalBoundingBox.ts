import { LatLonCoordinates } from "./LatLongCoordinates"

// Define a class for storing a 2D bounding box in spherical coordinates
export class SphericalBoundingBox {
  constructor(public min: LatLonCoordinates, public max: LatLonCoordinates) {}

  set(min: LatLonCoordinates, max: LatLonCoordinates) {
    this.min = min
    this.max = max
    return this
  }

  copy(other: SphericalBoundingBox) {
    this.min = other.min
    this.max = other.max
    return this
  }

  clone() {
    return new SphericalBoundingBox(this.min, this.max)
  }

  contains(other: LatLonCoordinates) {
    return (
      other.lat >= this.min.lat &&
      other.lat <= this.max.lat &&
      other.lon >= this.min.lon &&
      other.lon <= this.max.lon
    )
  }

  intersects(other: SphericalBoundingBox) {
    return (
      this.min.lat <= other.max.lat &&
      this.max.lat >= other.min.lat &&
      this.min.lon <= other.max.lon &&
      this.max.lon >= other.min.lon
    )
  }
  toJSON() {
    return {
      type: this.constructor.name,
      min: this.min,
      max: this.max,
    }
  }
}
