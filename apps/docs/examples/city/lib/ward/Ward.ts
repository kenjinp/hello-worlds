import { Polygon } from "../math/Polgygon"
import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"

export class Ward {
  public static MAIN_STREET = 2.0
  public static REGULAR_STREET = 1.0
  public static ALLEY = 0.6

  public geometry: Array<Polygon> = []

  constructor(public model: CityModel, public patch: Patch) {
    this.model = model
    this.patch = patch
  }

  public createGeometry() {
    this.geometry = []
  }
}
