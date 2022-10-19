import { Matrix4, Vector3 } from "three"
import { QuadTree } from "../quadtree/Quadtree"

export interface RingWorldQuadTreeProps {
  radius: number
  length: number
  minNodeSize: number
  origin: Vector3
}

export class RingWorldQuadTree {
  private sides: {
    transform: Matrix4
    worldToLocal: Matrix4
    quadtree: QuadTree
  }[] = []

  constructor(private props: RingWorldQuadTreeProps) {
    const r = props.radius
    let m
    const transforms: Matrix4[] = []

    // +X
    m = new Matrix4()
    m.makeRotationY(Math.PI / 2)
    m.premultiply(new Matrix4().makeTranslation(r, 0, 0))
    transforms.push(m)

    // -X
    m = new Matrix4()
    m.makeRotationY(-Math.PI / 2)
    m.premultiply(new Matrix4().makeTranslation(-r, 0, 0))
    transforms.push(m)

    // +Z
    m = new Matrix4()
    m.premultiply(new Matrix4().makeTranslation(0, 0, r))
    transforms.push(m)

    // -Z
    m = new Matrix4()
    m.makeRotationY(Math.PI)
    m.premultiply(new Matrix4().makeTranslation(0, 0, -r))
    transforms.push(m)

    for (let t of transforms) {
      this.sides.push({
        transform: t.clone(),
        worldToLocal: t.clone().invert(),
        quadtree: new QuadTree({
          size: r,
          minNodeSize: this.props.minNodeSize,
          localToWorld: t,
          origin: props.origin,
          radius: r,
        }),
      })
    }
  }

  getChildren() {
    const children = []

    for (let s of this.sides) {
      const side = {
        transform: s.transform,
        children: s.quadtree.getChildren(),
      }
      children.push(side)
    }
    return children
  }

  // create all possible children up to a minimum value
  // measuring from this position
  insert(pos: Vector3) {
    for (let s of this.sides) {
      s.quadtree.insert(pos)
    }
  }
}
