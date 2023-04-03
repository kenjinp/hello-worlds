import { Vector3 } from "three"
import { CityModel } from "../model/Model"
import { Graph } from "./Graph"
import { Node } from "./Node"

export const differenceVector3 = (a: Vector3[], b: Vector3[]) => {
  return a.filter(x => b.some(y => x.equals(y)))
}

export class Topology {
  private graph = new Graph()

  public vector3ToNode: Map<Vector3, Node> = new Map()
  public nodeToVector3: Map<Node, Vector3> = new Map()

  private blocked: Array<Vector3> = []

  public inner: Set<Node> = new Set()
  public outer: Set<Node> = new Set()

  constructor(private model: CityModel) {
    // Building a list of all blocked points (shore + walls excluding gates)
    if (this.model.citadel) {
      this.blocked = this.blocked.concat(this.model.citadel.shape.vertices)
    }
    if (this.model.wall) {
      this.blocked = this.blocked.concat(this.model.wall.shape.vertices)
    }
    this.blocked = differenceVector3(this.blocked, this.model.gates)

    const border = this.model.border.shape

    for (let patch of this.model.patches) {
      let withinCity = patch.withinCity
      let v1 = patch.shape.last
      let n1 = this.processPoint(v1)

      for (let i = 0; i < patch.shape.length; i++) {
        let v0 = v1
        v1 = patch.shape.vertices[i]
        let n0 = n1
        n1 = this.processPoint(v1)

        if (n0 && !border.contains(v0)) {
          if (withinCity) this.inner.add(n0)
          else this.outer.add(n0)
        }
        if (n1 && !border.contains(v1)) {
          if (withinCity) this.inner.add(n1)
          else this.outer.add(n1)
        }
        if (n0 && n1) {
          n0.link(n1, v0.distanceTo(v1))
        }
      }
    }
  }

  private processPoint(v: Vector3): Node {
    let n: Node

    if (this.vector3ToNode.has(v)) {
      n = this.vector3ToNode.get(v)
    } else {
      n = this.graph.add()
      this.vector3ToNode.set(v, n)
      this.nodeToVector3.set(n, v)
    }

    return this.blocked.includes(v) ? null : n
  }

  public buildPath(
    from: Vector3,
    to: Vector3,
    exclude: Array<Node> = null,
  ): Array<Vector3> {
    console.log({
      from,
      to,
      exclude,
      blah: this.vector3ToNode.get(from),
      blah2to: this.vector3ToNode.get(to),
      map: this.vector3ToNode
    })
    const path = this.graph.aStar(
      this.vector3ToNode.get(from),
      this.vector3ToNode.get(to),
      exclude,
    )
    console.log(
      "path",
      path,
      path?.map(n => this.nodeToVector3.get(n)),
    )
    return !path ? null : path.map(n => this.nodeToVector3.get(n))
  }
}
