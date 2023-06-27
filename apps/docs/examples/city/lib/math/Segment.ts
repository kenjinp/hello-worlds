import { Vector3 } from "three"

export class Segment {
  constructor(public start: Vector3, public end: Vector3) {}

  public get dx(): number {
    return this.end.x - this.start.x
  }

  public get dy(): number {
    return this.end.y - this.start.y
  }

  public get dz(): number {
    return this.end.z - this.start.z
  }

  public get vector(): Vector3 {
    return this.end.clone().sub(this.start)
  }

  public get length(): number {
    return this.start.distanceTo(this.end)
  }
}
