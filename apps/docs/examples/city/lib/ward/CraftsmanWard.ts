import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CommonWard } from "./CommonWard"

export class CraftsmenWard extends CommonWard {
  constructor(model: CityModel, patch: Patch) {
    super(
      model,
      patch,
      10 + 80 * model.random.float() * model.random.float(), // small to large
      0.5 + model.random.float() * 0.2, // moderately regular
      0.6,
    )
  }

  public override getLabel() {
    return "Craftsmen"
  }
}
