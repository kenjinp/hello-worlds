import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CommonWard } from "./CommonWard"
import { Ward } from "./Ward"

export class MilitaryWard extends CommonWard {
  public override createGeometry() {
    let block = this.getCityBlock()
    this.geometry = Ward.createAlleys(
      block,
      Math.sqrt(block.square) * (1 + this.model.random.float()),
      0.1 + this.model.random.float() * 0.3,
      0.3, // regular
      0.25, // squares
    )
  }

  public static rateLocation(model: CityModel, patch: Patch) {
    // Military ward should border the citadel or the city walls
    if (model.citadel && model.citadel.shape.bordersPolygon(patch.shape)) {
      return 0
    } else if (model.wall && model.wall.bordersPatch(patch)) {
      return 1
    } else {
      return !model.citadel && !model.wall ? 0 : Infinity
    }
  }

  public override getLabel() {
    return "Military"
  }
}
