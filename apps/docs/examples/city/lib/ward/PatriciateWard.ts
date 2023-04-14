import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { CommonWard } from "./CommonWard"
import { Park } from "./Park"
import { Slum } from "./Slum"

export class PatriciateWard extends CommonWard {
  constructor(model: CityModel, patch: Patch) {
    super(
      model,
      patch,
      80 + 30 * model.random.float() * model.random.float(), // large
      0.5 + model.random.float() * 0.3, // moderate regularity
      0.8, // regular
      0.2,
    )
  }

  public static rateLocation(model: CityModel, patch: Patch) {
    // Patriciate ward prefers to border a park and not to border slums
    let rate = 0
    for (let p of model.patches) {
      if (p.ward && p.shape.bordersPolygon(patch.shape)) {
        if (p.ward instanceof Park) {
          rate--
        } else if (p.ward instanceof Slum) {
          rate++
        }
      }
    }
    return rate
  }

  public override getLabel() {
    return "Patriciate"
  }
}
