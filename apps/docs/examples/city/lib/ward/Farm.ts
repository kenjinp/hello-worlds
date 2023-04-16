import { sample } from "@hello-worlds/core"
import { Polygon } from "../math/Polygon"
import { Ward } from "./Ward"

export class Farm extends Ward {
  public override createGeometry() {
    const housing = Polygon.rect(4, 4)
    const pos = sample(this.patch.shape.vertices)[0].lerp(
      this.patch.shape.centroid,
      0.3 + this.model.random.float() * 0.4,
    )
    housing.rotate(this.model.random.float() * Math.PI)
    housing.offset(pos)
    this.geometry = this.createOrthoBuilding(housing, 8, 1)
  }

  public override getLabel() {
    return "Farm"
  }
}
