import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CityWall } from "../model/Wall"
import { Ward } from "./Ward"

export class Castle extends Ward {
  public wall: CityWall

  constructor(model: CityModel, patch: Patch) {
    super(model, patch)

    this.wall = new CityWall(
      true,
      model,
      [patch],
      patch.shape.vertices.filter(v =>
        model.patchByVertex(v).some(p => !p.withinCity),
      ),
    )
  }

  public override createGeometry() {
    let block = this.patch.shape.shrinkEq(Ward.MAIN_STREET * 2)
    this.geometry = this.createOrthoBuilding(
      block,
      Math.sqrt(block.square) * 4,
      0.6,
    )
  }

  public override getLabel() {
    return "Castle"
  }
}
