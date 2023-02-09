import { SphericalBoundingBox } from "./SphericalBoundingBox"

export class SphericalCell<T> {
  public entities: T[] = []
  constructor(public sphericalBoundingBox: SphericalBoundingBox) {}

  add(entity: T) {
    this.entities.push(entity)
  }

  remove(entity: T) {
    const index = this.entities.indexOf(entity)
    this.entities.splice(index, 1)
  }

  makeEmpty() {
    this.entities.length = 0
  }

  intersects(sphericalBoundingBox: SphericalBoundingBox) {
    return this.sphericalBoundingBox.intersects(sphericalBoundingBox)
  }

  empty() {
    return this.entities.length === 0
  }
}
