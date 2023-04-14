import { ring } from "../math/Cutter"
import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { Ward } from "./Ward"

export class Cathedral extends Ward {
  public override createGeometry() {
    this.geometry = this.model.random.bool(0.4)
      ? ring(this.getCityBlock(), 2 + this.model.random.float() * 4)
      : this.createOrthoBuilding(this.getCityBlock(), 20, 0.8)
  }

  public static rateLocation(model: CityModel, patch: Patch) {
    // Ideally the main temple should overlook the plaza,
    // otherwise it should be as close to the plaza as possible
    return model.plaza != null && patch.shape.bordersPolygon(model.plaza.shape)
      ? -1 / patch.shape.square
      : patch.shape.minDistance(
          model.plaza != null ? model.plaza.shape.center : model.center,
        ) * patch.shape.square
  }

  public override getLabel() {
    return "Temple"
  }
}
