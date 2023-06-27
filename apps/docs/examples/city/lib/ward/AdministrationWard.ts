import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CommonWard } from "./CommonWard"

export class AdministrationWard extends CommonWard {
  constructor(model: CityModel, patch: Patch) {
    super(
      model,
      patch,
      80 + 30 * model.random.float() * model.random.float(), // large
      0.1 + model.random.float() * 0.3,
      0.3, // regular
    )
  }

  public static rateLocation(model: CityModel, patch: Patch) {
    // Ideally administration ward should overlook the plaza,
    // otherwise it should be as close to the plaza as possible
    return !!model.plaza
      ? patch.shape.bordersPolygon(model.plaza.shape)
        ? 0
        : patch.shape.minDistance(model.plaza.shape.center)
      : patch.shape.minDistance(model.center)
  }

  public override getLabel() {
    return "Administration"
  }
}
