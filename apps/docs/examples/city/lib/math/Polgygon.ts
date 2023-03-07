import { Vector3 } from "three"

const EPSILON = 0.1

export class Polygon {
  constructor(public vertices: Vector3[] = []) {}

  get min() {
    return this.vertices.sort((a, b) => a.length() - b.length())[0]
  }

  get length() {
    return this.vertices.length
  }

  public contains(v: Vector3): boolean {
    return this.vertices.some(p => v.distanceTo(p) < EPSILON)
  }

  public remove(v: Vector3) {
    this.vertices.splice(this.vertices.indexOf(v), 1)
  }

  public copy() {
    return new Polygon(this.vertices.map(v => v.clone()))
  }

  public forEdge(callback: (a: Vector3, b: Vector3) => void | boolean) {
    for (let i = 0; i < this.vertices.length; i++) {
      if (
        callback(
          this.vertices[i],
          this.vertices[(i + 1) % this.vertices.length],
        ) === false
      ) {
        break
      }
    }
  }

  public static matchPoint(a: Vector3, b: Vector3) {
    return a.distanceTo(b) < EPSILON
  }

  // public findEdgeIndex(a: Vector3, b: Vector3) {
  //   let index = this.vertices.findIndex(v => v.distanceTo(a) < EPSILON)

  // }

  public sharesEdges(a1: Vector3, b1: Vector3) {
    let sharesAnEdge = false
    this.forEdge((a, b) => {
      if (a1.distanceTo(a) < EPSILON && b1.distanceTo(b) < EPSILON) {
        sharesAnEdge = true
        return false
      }
    })
    return sharesAnEdge
  }

  public next(v: Vector3) {
    return this.vertices[(this.vertices.indexOf(v) + 1) % this.vertices.length]
  }

  public prev(v: Vector3) {
    return this.vertices[
      (this.vertices.indexOf(v) + this.vertices.length - 1) %
        this.vertices.length
    ]
  }

  public smoothVertex(v: Vector3, f = 1.0): Vector3 {
    var prev = this.prev(v)
    var next = this.next(v)
    return new Vector3(
      prev.x + v.x * f + next.x,
      prev.y + v.y * f + next.y,
      prev.z + v.z * f + next.z,
    ).multiplyScalar(1 / (2 + f)) // might not be multiply, but add, not sure
  }

  public set(vs: Vector3[]) {
    this.vertices = vs
  }
}
