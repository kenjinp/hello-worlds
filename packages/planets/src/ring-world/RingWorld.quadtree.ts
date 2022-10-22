import * as THREE from "three"
import { Box3, Object3D, Vector3 } from "three"
import { tempVector3 } from "../utils"

const CHILD_SIZE_X_COMPARATOR = 1.25
const CHILD_QUADTREE_RATIO_COMPARATOR = 1.05

export interface CylinderQuadTreeParams {
  localToWorld: THREE.Matrix4
  height: number
  minNodeSize: number
  origin: THREE.Vector3
  radius: number
}

export interface Node {
  bounds: THREE.Box3
  children: Node[]
  center: THREE.Vector3
  worldCenter: THREE.Vector3
  size: THREE.Vector3
  root?: boolean
}

export class CylinderQuadTree extends Object3D {
  private root: Node
  constructor(private params: CylinderQuadTreeParams) {
    super()
    const s = params.height
    const r = params.radius
    const b = new THREE.Box3(
      new THREE.Vector3(-r, -s / 2, 0),
      new THREE.Vector3(r, s / 2, 0),
    )

    // debug helper
    // const bh = new Box3Helper(b, new Color(0xffff00))
    // bh.applyMatrix4(this.params.localToWorld)
    // bh.position.add(params.origin)
    // this.add(bh)

    const center = b.getCenter(tempVector3)

    // note world center is what we use to compare the camera distance to
    // so it should be 'bent' into the right shape
    const worldCenter = center.clone()
    worldCenter.applyMatrix4(this.params.localToWorld)
    worldCenter.add(params.origin)
    // b.setFromCenterAndSize(params.origin, new Vector3(s, s, s))
    this.root = {
      bounds: b,
      children: [],
      center,
      worldCenter,
      // sphereCenter: b.getCenter(new THREE.Vector3()),
      size: b.getSize(new THREE.Vector3()),
      root: true,
    }
    // this.root.sphereCenter = this.root.center.clone()
    // this.root.sphereCenter.applyMatrix4(this.params.localToWorld)
    // this.root.sphereCenter.normalize()
    // this.root.sphereCenter.multiply(new Vector3(r, s / 2, 0))
    // this.root.sphereCenter.add(params.origin)
  }

  getChildren() {
    const children: Node[] = []
    this.#getChildren(this.root, children)
    return children
  }

  #getChildren(node: Node, targetNodes: Node[]) {
    if (node.children.length === 0) {
      targetNodes.push(node)
      return
    }

    for (let c of node.children) {
      this.#getChildren(c, targetNodes)
    }
  }

  insert(pos: THREE.Vector3) {
    this.#insert(this.root, pos)
  }

  #insert(child: Node, pos: THREE.Vector3) {
    const distToChild = this.#distanceToChild(child, pos)
    const { x, y } = child.size
    const comparator = x > y ? x : y

    if (
      distToChild < comparator * CHILD_SIZE_X_COMPARATOR &&
      comparator > this.params.minNodeSize
    ) {
      child.children = this.#createChildren(child)

      for (let c of child.children) {
        this.#insert(c, pos)
      }
    }
  }

  #distanceToChild(child: Node, pos: THREE.Vector3): number {
    return child.worldCenter.distanceTo(pos)
  }

  #createChildren(child: Node): Node[] {
    const midpoint = child.bounds.getCenter(new Vector3())
    const longestAxis = child.size.x > child.size.y ? "x" : "y"
    const shortestAxis = longestAxis === "x" ? "y" : "x"

    const ratio = child.size[longestAxis] / child.size[shortestAxis]

    const childrenBounds: Box3[] = []

    if (ratio > CHILD_QUADTREE_RATIO_COMPARATOR) {
      // split in twain
      if (longestAxis === "x") {
        // Left
        const b1 = new THREE.Box3(
          child.bounds.min,
          tempVector3.set(midpoint.x, child.bounds.max.y, 0).clone(),
        )
        // Right
        const b2 = new THREE.Box3(
          tempVector3.set(midpoint.x, child.bounds.min.y, 0).clone(),
          tempVector3.set(child.bounds.max.x, child.bounds.max.y, 0).clone(),
        )

        childrenBounds.push(b1, b2)
      } else {
        // UP
        const b1 = new THREE.Box3(
          child.bounds.min,
          tempVector3.set(child.bounds.max.x, midpoint.y, 0).clone(),
        )
        // DOWN
        const b2 = new THREE.Box3(
          tempVector3.set(child.bounds.min.x, midpoint.y, 0).clone(),
          child.bounds.max,
        )

        childrenBounds.push(b1, b2)
      }
    } else {
      // split in quads

      // Bottom left
      const b1 = new THREE.Box3(child.bounds.min, midpoint)

      // Bottom right
      const b2 = new THREE.Box3(
        new THREE.Vector3(midpoint.x, child.bounds.min.y, 0),
        new THREE.Vector3(child.bounds.max.x, midpoint.y, 0),
      )

      // Top left
      const b3 = new THREE.Box3(
        new THREE.Vector3(child.bounds.min.x, midpoint.y, 0),
        new THREE.Vector3(midpoint.x, child.bounds.max.y, 0),
      )

      // Top right
      const b4 = new THREE.Box3(midpoint, child.bounds.max)
      childrenBounds.push(b1, b2, b3, b4)
    }

    const children = childrenBounds.map(b => {
      const center = b.getCenter(new THREE.Vector3())
      const worldCenter = center.clone()
      worldCenter.applyMatrix4(this.params.localToWorld)
      worldCenter.add(this.params.origin)

      // const bh = new Box3Helper(b, new Color(Math.random() * 0xffffff))
      // bh.applyMatrix4(this.params.localToWorld)
      // // bh.position.add(this.params.origin)
      // this.add(bh)

      return {
        bounds: b,
        children: [],
        size: b.getSize(new THREE.Vector3()),
        worldCenter,
        // sphereCenter,
        center,
      }
    })

    return children
  }
}
