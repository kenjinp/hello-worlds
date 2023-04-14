import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CommonWard } from "./CommonWard"

export class MerchantWard extends CommonWard {
  constructor(model: CityModel, patch: Patch) {
    super(
      model,
      patch,
      50 + 60 * model.random.float() * model.random.float(), // medium to large
      0.5 + model.random.float() * 0.3,
      0.7, // moderately regular
      0.15,
    )
  }

  public static rateLocation(model: CityModel, patch: Patch) {
    // Merchant ward should be as close to the center as possible
    return patch.shape.minDistance(
      model.plaza != null ? model.plaza.shape.center : model.center,
    )
  }

  public override getLabel() {
    return "Merchant"
  }
}
