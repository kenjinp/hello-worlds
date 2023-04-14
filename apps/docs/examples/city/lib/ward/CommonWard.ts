import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"
import { Ward } from "./Ward"

export class CommonWard extends Ward {
  constructor(
    model: CityModel,
    patch: Patch,
    private minSq: number,
    private gridChaos: number,
    private sizeChaos: number,
    private emptyProb = 0.04,
  ) {
    super(model, patch)
  }

  public override createGeometry() {
    let block = this.getCityBlock()
    this.geometry = Ward.createAlleys(
      block,
      this.minSq,
      this.gridChaos,
      this.sizeChaos,
      this.emptyProb,
    )

    if (!this.model.isEnclosed(this.patch)) {
      console.log("filtering outskirts")
      this.filterOutskirts()
    }
  }
}
