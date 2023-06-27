import { radial, semiRadial } from "../math/Cutter"
import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { Ward } from "./Ward"

export class Park extends Ward {
  public override createGeometry() {
    const block = this.getCityBlock()
    this.geometry =
      block.compactness >= 0.7
        ? radial(block, null, Ward.ALLEY)
        : semiRadial(block, null, Ward.ALLEY)
  }

  public static rateLocation(model: CityModel, patch: Patch) {
    // Ideally the main temple should overlook the plaza,
    // otherwise it should be as close to the plaza as possible
    return model.plaza && patch.shape.bordersPolygon(model.plaza.shape)
      ? -1 / patch.shape.square
      : patch.shape.minDistance(
          model.plaza ? model.plaza.shape.center : model.center,
        ) * patch.shape.square
  }

  public override getLabel() {
    return "Park"
  }
}
