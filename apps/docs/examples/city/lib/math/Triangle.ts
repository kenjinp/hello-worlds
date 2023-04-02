import { Vector3 } from "three"

export class Triangle {
  p1: Vector3
  p2: Vector3
  p3: Vector3
  c: Vector3
  r: number

  constructor(p1: Vector3, p2: Vector3, p3: Vector3) {
    const s =
      (p2.x - p1.x) * (p2.y + p1.y) +
      (p3.x - p2.x) * (p3.y + p2.y) +
      (p1.x - p3.x) * (p1.y + p3.y)
    this.p1 = p1
    // CCW
    this.p2 = s > 0 ? p2 : p3
    this.p3 = s > 0 ? p3 : p2

    const x1 = (p1.x + p2.x) / 2
    const y1 = (p1.y + p2.y) / 2
    const x2 = (p2.x + p3.x) / 2
    const y2 = (p2.y + p3.y) / 2

    const dx1 = p1.y - p2.y
    const dy1 = p2.x - p1.x
    const dx2 = p2.y - p3.y
    const dy2 = p3.x - p2.x

    const tg1 = dy1 / dx1
    const t2 = (y1 - y2 - (x1 - x2) * tg1) / (dy2 - dx2 * tg1)

    this.c = new Vector3(x2 + dx2 * t2, y2 + dy2 * t2)
    this.r = this.c.distanceTo(p1)
  }

  public hasEdge(a: Vector3, b: Vector3): boolean {
    return (
      (this.p1.equals(a) && this.p2.equals(b)) ||
      (this.p2.equals(a) && this.p3.equals(b)) ||
      (this.p3.equals(a) && this.p1.equals(b))
    )
  }

  public midpoint(target = new Vector3()): Vector3 {
    return target
      .addVectors(this.p2, this.p3)
      .add(this.p1)
      .multiplyScalar(1 / 3)
  }
}
