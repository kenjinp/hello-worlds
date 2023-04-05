import { Vector3 } from "three"
import { Polygon } from "../math/Polygon"
import { Random } from "../math/Random"
import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { Ward } from "./Ward"

const random = new Random()

export class Market extends Ward {
  public override createGeometry() {
    // fountain or statue
    let statue = random.bool(0.6)
    // we always offset a statue and sometimes a fountain
    let offset = statue || random.bool(0.3)

    let v0: Vector3 = null
    let v1: Vector3 = null
    if (statue || offset) {
      // we need an edge both for rotating a statue and offsetting
      let length = -1.0
      this.patch.shape.forEdge((p0, p1) => {
        let len = p0.distanceTo(p1)
        if (len > length) {
          length = len
          v0 = p0
          v1 = p1
        }
      })
    }

    let object: Polygon
    if (statue) {
      object = Polygon.rect(1 + random.float(), 1 + random.float())
      object.rotate(Math.atan2(v1.y - v0.y, v1.x - v0.x))
    } else {
      object = Polygon.circle(1 + random.float())
    }

    if (offset) {
      let gravity = v0.lerp(v1, 0.5)
      object.offset(
        this.patch.shape.centroid.lerp(gravity, 0.2 + random.float() * 0.4),
      )
    } else {
      object.offset(this.patch.shape.centroid)
    }

    this.geometry = [object]
  }

  public static rateLocation(model: CityModel, patch: Patch): number {
    // One market should not touch another
    for (let p of model.inner)
      if (p.ward instanceof Market && p.shape.bordersPolygon(patch.shape))
        return Infinity

    // Market shouldn't be much larger than the plaza
    return !!model.plaza
      ? patch.shape.square / model.plaza.shape.square
      : patch.shape.minDistance(model.center)
  }

  public override getLabel() {
    return "Market"
  }
}
