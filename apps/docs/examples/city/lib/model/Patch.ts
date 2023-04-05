import { Vector3 } from "three"
import { Polygon } from "../math/Polygon"
import { Region } from "../math/Region"
import { Ward } from "../ward/Ward"

export class Patch {
  public shape: Polygon
  public ward: Ward

  public withinWalls = false
  public withinCity = false

  constructor(vertices: Vector3[]) {
    this.shape = new Polygon(vertices)
  }

  public static fromRegion(r: Region): Patch {
    return new Patch(r.vertices.map(tr => tr.c))
  }
}
