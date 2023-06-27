import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CommonWard } from "./CommonWard"

export class GateWard extends CommonWard {
  constructor(model: CityModel, patch: Patch) {
    super(
      model,
      patch,
      10 + 50 * model.random.float() * model.random.float(),
      0.5 + model.random.float() * 0.3,
      0.7,
    )
  }

  public override getLabel() {
    return "Gate"
  }
}
