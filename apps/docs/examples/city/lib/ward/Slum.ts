import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CommonWard } from "./CommonWard"

export class Slum extends CommonWard {
  constructor(model: CityModel, patch: Patch) {
    super(
      model,
      patch,
      10 + 30 * model.random.float() * model.random.float(), // small to medium
      0.6 + model.random.float() * 0.4,
      0.8, // chaotic
      0.03,
    )
  }

  public static rateLocation(model: CityModel, patch: Patch): number {
    // Slums should be as far from the center as possible
    return -patch.shape.minDistance(
      model.plaza != null ? model.plaza.shape.center : model.center,
    )
  }

  public override getLabel() {
    return "Slum"
  }
}
