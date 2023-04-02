import { Vector3 } from "three"

const EPSILON = 0.1

export const rotate90 = (v: Vector3) => new Vector3(-v.y, v.x, v.z)

export function cross(x1: number, y1: number, x2: number, y2: number) {
  return x1 * y2 - y1 * x2
}

const removeElementFromArray = (array: any[], element: any) => {
  const index = array.indexOf(element)
  if (index !== -1) {
    array.splice(index, 1)
  }
}

export const scalar = (
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
) => x1 * x2 + y1 * y2 + z1 * z2

export function intersectLines(
  x1: number,
  y1: number,
  dx1: number,
  dy1: number,
  x2: number,
  y2: number,
  dx2: number,
  dy2: number,
) {
  let d = dx1 * dy2 - dy1 * dx2
  if (d == 0) return null

  let t2 = (dy1 * (x2 - x1) - dx1 * (y2 - y1)) / d
  let t1 = dx1 != 0 ? (x2 - x1 + dx2 * t2) / dx1 : (y2 - y1 + dy2 * t2) / dy1

  return new Vector3(t1, t2, 0)
}

export function distance2line(
  x1: number,
  y1: number,
  dx1: number,
  dy1: number,
  x0: number,
  y0: number,
): number {
  return (
    (dx1 * y0 - dy1 * x0 + (y1 + dy1) * x1 - (x1 + dx1) * y1) /
    Math.sqrt(dx1 * dx1 + dy1 * dy1)
  )
}

export const DELTA = 0.000001

export class Polygon {
  public static DELTA = DELTA

  constructor(public vertices: Vector3[] = []) {}

  // Faster approximation of centroid
  public get center(): Vector3 {
    let c = new Vector3()
    for (let v of this.vertices) {
      c.add(v)
    }
    c.multiplyScalar(1 / this.length)
    return c
  }

  public get centroid(): Vector3 {
    let x = 0.0
    let y = 0.0
    let a = 0.0
    this.forEdge((v0, v1) => {
      let f = cross(v0.x, v0.y, v1.x, v1.y)
      a += f
      x += (v0.x + v1.x) * f
      y += (v0.y + v1.y) * f
    })
    let s6 = 1 / (3 * a)
    return new Vector3(s6 * x, s6 * y, 0)
  }

  get min() {
    return this.minPredicate(v => v.length())
  }

  get max() {
    return this.maxPredicate(v => v.length())
  }

  public maxPredicate(predicate: (v: Vector3) => number) {
    let maxIndex = 0
    let maxVal = predicate(this.vertices[maxIndex])
    for (let i = 1; i < this.vertices.length; i++) {
      const l = predicate(this.vertices[i])
      if (l > maxVal) {
        maxVal = l
        maxIndex = i
      }
    }
    return this.vertices[maxIndex]
  }

  public minPredicate(predicate: (v: Vector3) => number) {
    let minIndex = 0
    let minVal = predicate(this.vertices[minIndex])
    for (let i = 1; i < this.vertices.length; i++) {
      const l = predicate(this.vertices[i])
      if (l < minVal) {
        minVal = l
        minIndex = i
      }
    }
    return this.vertices[minIndex]
  }

  get length() {
    return this.vertices.length
  }

  public contains(v: Vector3): boolean {
    if (!v) {
      throw new Error("Vector is null")
    }
    return this.vertices.some(p => v.equals(p))
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

  public findEdge(a: Vector3, b: Vector3): number {
    let index = this.vertices.indexOf(a)
    return index != -1 && this.vertices[(index + 1) % this.length] == b
      ? index
      : -1
  }

  public hasEdge(a: Vector3, b: Vector3): boolean {
    return this.findEdge(a, b) !== -1
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
    let prev = this.prev(v)
    let next = this.next(v)
    return new Vector3(
      prev.x + v.x * f + next.x,
      prev.y + v.y * f + next.y,
      prev.z + v.z * f + next.z,
    ).multiplyScalar(1 / (2 + f)) // might not be multiply, but add, not sure
  }

  public set(vs: Vector3[]) {
    this.vertices = vs
  }

  public split(p1: Vector3, p2: Vector3) {
    return this.splitAtIndex(
      this.vertices.indexOf(p1),
      this.vertices.indexOf(p2),
    )
  }

  public splitAtIndex(i1: number, i2: number) {
    if (i1 > i2) {
      let t = i1
      i1 = i2
      i2 = t
    }

    return [
      new Polygon(this.vertices.slice(i1, i2 + 1)),
      new Polygon(
        this.vertices.slice(i2).concat(this.vertices.slice(0, i1 + 1)),
      ),
    ]
  }

  // This function returns minimal distance from any of the vertices
  // to a point, not real distance from the polygon
  public minDistance(v: Vector3) {
    return this.vertices.reduce(
      (min, p) => Math.min(min, p.distanceTo(v)),
      Infinity,
    )
  }

  public isConvexVertex(v1: Vector3): boolean {
    let v0 = this.prev(v1)
    let v2 = this.next(v1)
    return cross(v1.x - v0.x, v1.y - v0.y, v2.x - v1.x, v2.y - v1.y) > 0
  }

  public isConvex(): boolean {
    for (let v of this.vertices) {
      if (!this.isConvexVertex(v)) return false
    }
    return true
  }

  public vector(v: Vector3) {
    return this.next(v).sub(v)
  }

  public vectorByIndex(i: number) {
    return this.vertices[i == this.vertices.length - 1 ? 0 : i + 1].sub(
      this.vertices[i],
    )
  }

  public get square() {
    let v1 = this.vertices[this.vertices.length - 1]
    let v2 = this.vertices[0]
    let s = v1.x * v2.y - v2.x * v1.y
    for (let i = 1; i < this.vertices.length; i++) {
      v1 = v2
      v2 = this.vertices[i]
      s += v1.x * v2.y - v2.x * v1.y
    }
    return s * 0.5
  }

  public get perimeter() {
    let len = 0.0
    this.forEdge((v0, v1) => {
      len += v0.distanceTo(v1)
    })
    return len
  }

  // for circle	= 1.00
  // for square	= 0.79

  // for triangle	= 0.60
  public get compactness() {
    let p = this.perimeter
    return (4 * Math.PI * this.square) / (p * p)
  }

  public get last() {
    return this.vertices[this.vertices.length - 1]
  }

  public bordersPolygon(another: Polygon) {
    let len1 = this.length
    let len2 = another.length
    for (let i = 0; i < len1; i++) {
      let j = another.vertices.indexOf(this.vertices[i])
      if (j !== -1) {
        let next = this.vertices[(i + 1) % len1]
        // If this cause is not true, then should return false,
        // but it doesn't work for some reason
        if (
          next == another.vertices[(j + 1) % len2] ||
          next == another.vertices[(j + len2 - 1) % len2]
        ) {
          return true
        }
      }
    }
    return false
  }

  // This function insets all edges by distances defined in an array.
  // It can't outset a polygon. Works very well for convex polygons,
  // not so much concave ones. It produces a convex polygon.
  // It does change the number vertices
  public shrink(d: Array<number>): Polygon {
    let q = new Polygon(this.vertices)
    let i = 0
    this.forEdge((v1, v2) => {
      let dd = d[i++]
      if (dd > 0) {
        let v = v2.sub(v1)
        let n = rotate90(v.clone()).normalize().multiplyScalar(dd)
        q = q.cut(v1.add(n), v2.add(n), 0)[0]
      }
    })
    return q
  }

  public shrinkEq(d: number): Polygon {
    return this.shrink([...this.vertices].map(() => d))
  }

  public smoothVertexEq(f = 1.0): Polygon {
    let len = this.vertices.length
    let v1 = this.vertices[len - 1]
    let v2 = this.vertices[0]
    return new Polygon(
      [...this.vertices].map((vertex, i) => {
        let v0 = v1
        v1 = v2
        v2 = this.vertices[(i + 1) % len]
        return new Vector3(
          (v0.x + v1.x * f + v2.x) / (2 + f),
          (v0.y + v1.y * f + v2.y) / (2 + f),
          (v0.z + v1.z * f + v2.z) / (2 + f),
        )
      }),
    )
  }

  public rotate(a: number) {
    let cosA = Math.cos(a)
    let sinA = Math.sin(a)
    for (let v of this.vertices) {
      let vx = v.x * cosA - v.y * sinA
      let vy = v.y * cosA + v.x * sinA
      v.set(vx, vy, 0)
    }
  }

  public offset(p: Vector3) {
    let dx = p.x
    let dy = p.y
    for (let v of this.vertices) {
      v.add(new Vector3(dx, dy, 0))
    }
  }

  // A version of "shrink" function for insetting just one edge.
  // It effectively cuts a peel along the edge.
  public peel(v1: Vector3, d: number): Polygon {
    let i1 = this.vertices.indexOf(v1)
    let i2 = i1 === this.vertices.length - 1 ? 0 : i1 + 1
    let v2 = this.vertices[i2]

    let v = v2.sub(v1)
    let n = rotate90(v.clone()).normalize().multiplyScalar(d)

    return this.cut(v1.add(n), v2.add(n), 0)[0]
  }

  public cut(p1: Vector3, p2: Vector3, gap = 0): Array<Polygon> {
    let x1 = p1.x
    let y1 = p1.y
    let dx1 = p2.x - x1
    let dy1 = p2.y - y1

    let len = this.vertices.length
    let edge1 = 0,
      ratio1 = 0.0
    let edge2 = 0,
      ratio2 = 0.0
    let count = 0

    for (let i = 0; i < len; i++) {
      let v0 = this.vertices[i]
      let v1 = this.vertices[(i + 1) % len]

      let x2 = v0.x
      let y2 = v0.y
      let dx2 = v1.x - x2
      let dy2 = v1.y - y2

      let t = intersectLines(x1, y1, dx1, dy1, x2, y2, dx2, dy2)
      if (t != null && t.y >= 0 && t.y <= 1) {
        switch (count) {
          case 0:
            edge1 = i
            ratio1 = t.x
          case 1:
            edge2 = i
            ratio2 = t.x
        }
        count++
      }
    }

    if (count == 2) {
      let point1 = p1.add(p2.sub(p1).multiplyScalar(ratio1))
      let point2 = p1.add(p2.sub(p1).multiplyScalar(ratio2))

      let half1 = new Polygon(this.vertices.slice(edge1 + 1, edge2 + 1))
      half1.vertices.unshift(point1)
      half1.vertices.push(point2)

      let half2 = new Polygon(
        this.vertices
          .slice(edge2 + 1)
          .concat(this.vertices.slice(0, edge1 + 1)),
      )
      half2.vertices.unshift(point2)
      half2.vertices.push(point1)

      if (gap > 0) {
        half1 = half1.peel(point2, gap / 2)
        half2 = half2.peel(point1, gap / 2)
      }

      let v = this.vectorByIndex(edge1)
      return cross(dx1, dy1, v.x, v.y) > 0 ? [half1, half2] : [half2, half1]
    } else return [new Polygon(this.vertices)]
  }

  // This function insets all edges by distances defined in an array.
  // It's kind of reliable for both convex and concave vertices, but only
  // if all distances are equal. Otherwise weird "steps" are created.
  // It does change the number of vertices.
  public insetAllEdgesByDistances(d: Array<number>): Polygon {
    // Creating a polygon (probably invalid) with offset edges
    let q = new Polygon()
    let i = 0
    this.forEdge((v0, v1) => {
      let dd = d[i++]
      if (dd == 0) {
        q.vertices.push(v0)
        q.vertices.push(v1)
      } else {
        // here we may want to do something fancier for nicer joints
        let v = v1.sub(v0)
        let n = rotate90(v.clone()).normalize().multiplyScalar(dd)
        q.vertices.push(v0.add(n))
        q.vertices.push(v1.add(n))
      }
    })

    // Creating a valid polygon by dealing with self-intersection:
    // we need to find intersections of every edge with every other edge
    // and add intersection point (twice - for one edge and for the other)
    let wasCut: boolean
    let lastEdge = 0
    do {
      wasCut = false

      let n = q.length
      for (let i = lastEdge; i < n - 2; i++) {
        lastEdge = i

        let p11 = q.vertices[i]
        let p12 = q.vertices[i + 1]
        let x1 = p11.x
        let y1 = p11.y
        let dx1 = p12.x - x1
        let dy1 = p12.y - y1

        for (let j = i + 2; j < (i > 0 ? n : n - 1); j++) {
          let p21 = q.vertices[j]
          let p22 = j < n - 1 ? q.vertices[j + 1] : q.vertices[0]
          let x2 = p21.x
          let y2 = p21.y
          let dx2 = p22.x - x2
          let dy2 = p22.y - y2

          let int = intersectLines(x1, y1, dx1, dy1, x2, y2, dx2, dy2)
          if (
            int != null &&
            int.x > Polygon.DELTA &&
            int.x < 1 - Polygon.DELTA &&
            int.y > Polygon.DELTA &&
            int.y < 1 - Polygon.DELTA
          ) {
            let pn = new Vector3(x1 + dx1 * int.x, y1 + dy1 * int.x, 0)

            q.vertices.splice(j + 1, 0, pn)

            q.vertices.splice(i + 1, 0, pn)

            wasCut = true
            break
          }
        }
        if (wasCut) break
      }
    } while (wasCut)

    // Checking every part of the polygon to pick the biggest
    let regular = new Array(q.length).fill(0).map((_, i) => i)

    let bestPart = null
    let bestPartSq = -Infinity

    while (regular.length > 0) {
      let indices: Array<number> = []
      let start = regular[0]
      let i = start
      do {
        indices.push(i)
        removeElementFromArray(regular, i)

        let next = (i + 1) % q.length
        let v = q.vertices[next]
        let next1 = q.vertices.indexOf(v)
        if (next1 == next) next1 = q.vertices.lastIndexOf(v)
        i = next1 == -1 ? next : next1
      } while (i != start)

      let p: Polygon = new Polygon(
        new Array(indices.length).fill(0).map((_, i) => q.vertices[i]),
      )
      let s = p.square
      if (s > bestPartSq) {
        bestPart = p
        bestPartSq = s
      }
    }

    return bestPart
  }

  public interpolate(p: Vector3): Array<number> {
    let sum = 0.0
    let dd = this.vertices
      .map(v => {
        let d = 1 / v.distanceTo(p)
        sum += d
        return d
      })
      .map(d => d / sum)
    return dd
  }

  public static rect(w = 1.0, h = 1.0): Polygon {
    return new Polygon([
      new Vector3(-w / 2, -h / 2, 0),
      new Vector3(w / 2, -h / 2, 0),
      new Vector3(w / 2, h / 2, 0),
      new Vector3(-w / 2, h / 2, 0),
    ])
  }

  public static regular(n = 8, r = 1.0): Polygon {
    return new Polygon(
      new Array(n).fill(0).map((_, i) => {
        let a = (i / n) * Math.PI * 2
        return new Vector3(r * Math.cos(a), r * Math.sin(a))
      }),
    )
  }

  public static circle(r = 1.0): Polygon {
    return Polygon.regular(16, r)
  }
}
