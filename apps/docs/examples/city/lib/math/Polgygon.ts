import { Vector3 } from "three"

export class Polygon {
  constructor(public readonly vertices: Vector3[]) {}

  get min() {
    return this.vertices.sort((a, b) => a.length() - b.length())[0]
  }

  get length() {
    return this.vertices.length
  }

  public contains(v: Vector3): boolean {
    return this.vertices.some(p => p.equals(v))
  }

  public remove(v: Vector3) {
    this.vertices.splice(this.vertices.indexOf(v), 1)
  }

  public copy () {
    return new Polygon(this.vertices.map(v => v.clone()))
  }
}
