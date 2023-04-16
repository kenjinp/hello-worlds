import { Vector3 } from "three"

const EPSILON = 0.1

// might be useful
// https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm

// This implementation uses the cross product of two vectors to determine if the line segments are parallel, and then solves for the intersection point using the parametric equations of the lines. The t and u variables represent the distances along the line segments where the intersection point occurs, and are checked to ensure that the intersection point is within both line segments.
interface LineSegment {
  start: Vector3
  end: Vector3
}

function lineIntersection(
  line1: LineSegment,
  line2: LineSegment,
): Vector3 | null {
  const x1 = line1.start.x,
    y1 = line1.start.y
  const x2 = line1.end.x,
    y2 = line1.end.y
  const x3 = line2.start.x,
    y3 = line2.start.y
  const x4 = line2.end.x,
    y4 = line2.end.y

  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

  if (denominator === 0) {
    // lines are parallel or coincident
    return null
  }

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    // intersection point is outside of at least one line segment
    return null
  }

  // calculate and return the point of intersection
  const intersectionX = x1 + ua * (x2 - x1)
  const intersectionY = y1 + ua * (y2 - y1)
  return new Vector3(intersectionX, intersectionY, 0)
}

function isPointOnLineSegment(
  point: Vector3,
  segmentStart: Vector3,
  segmentEnd: Vector3,
): boolean {
  const distanceStartToPoint = segmentStart.distanceTo(point)
  const distanceEndToPoint = segmentEnd.distanceTo(point)
  const segmentLength = segmentStart.distanceTo(segmentEnd)
  const epsilon = DELTA // A small value to account for floating-point errors
  return (
    Math.abs(distanceStartToPoint + distanceEndToPoint - segmentLength) <
      epsilon &&
    distanceStartToPoint < segmentLength + epsilon &&
    distanceEndToPoint < segmentLength + epsilon
  )
}

function splitPolygon(
  polygon: Polygon,
  lineSegment: LineSegment,
  gap,
): Polygon[] {
  const intersectionPoints: {
    edgeIndex: number
    point: Vector3
  }[] = []

  // Find all intersection points between the polygon and the line segment
  for (let i = 0; i < polygon.vertices.length; i++) {
    const currentPoint = polygon.vertices[i]
    const nextPoint = polygon.next(currentPoint)
    const polygonEdge: LineSegment = {
      start: currentPoint,
      end: nextPoint,
    }
    const intersection = lineIntersection(polygonEdge, lineSegment)
    if (intersection !== null) {
      intersectionPoints.push({
        edgeIndex: i,
        point: intersection,
      })
    }
  }

  if (intersectionPoints.length !== 2) {
    // The polygon is either not intersecting the line segment, or is intersecting it at more than two points
    return [polygon]
  }

  const point1 = intersectionPoints[0]
  const point2 = intersectionPoints[1]

  let half1 = new Polygon(
    polygon.vertices.slice(point1.edgeIndex + 1, point2.edgeIndex + 1),
  )
  half1.vertices.unshift(point1.point)
  half1.vertices.push(point2.point)

  let half2 = new Polygon(
    polygon.vertices
      .slice(point2.edgeIndex)
      .concat(polygon.vertices.slice(0, point1.edgeIndex + 1)),
  )
  half2.vertices.unshift(point2.point)
  half2.vertices.push(point1.point)
  half2.vertices.splice(1, 1)

  if (gap > 0) {
    half1 = half1.peel(point2.point, gap / 2)
    half2 = half2.peel(point1.point, gap / 2)
  }

  let v = polygon.vectorByIndex(point1.edgeIndex)
  let dx1 = lineSegment.end.x - lineSegment.start.x
  let dy1 = lineSegment.end.y - lineSegment.start.y
  return cross(dx1, dy1, v.x, v.y) > 0 ? [half1, half2] : [half2, half1]
}

export const perpendicular = (v: Vector3) => new Vector3(-v.y, v.x, v.z)

export function cross(x1: number, y1: number, x2: number, y2: number) {
  return x1 * y2 - y1 * x2
}

function crossProduct(p1: Vector3, p2: Vector3): number {
  return p1.x * p2.y - p1.y * p2.x
}

export function normalize(v: Vector3, thickness: number) {
  const { x, y, z } = v.clone()
  const norm = thickness / Math.sqrt(x * x + y * y)
  return new Vector3(x * norm, y * norm, z)
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
  let t1 = dx1 !== 0 ? (x2 - x1 + dx2 * t2) / dx1 : (y2 - y1 + dy2 * t2) / dy1

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

  constructor(public vertices: Vector3[] = []) {
    // if (vertices.length < 3) {
    //   throw new Error("Polygon must have at least 3 vertices")
    // }
  }

  clone() {
    return new Polygon(this.vertices.map(v => v.clone()))
  }

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
      let f = crossProduct(v0, v1)
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

  public forEdge(
    callback: (a: Vector3, b: Vector3, edgeIndex: number) => void | boolean,
  ) {
    for (let i = 0; i < this.vertices.length; i++) {
      if (
        callback(
          this.vertices[i],
          this.vertices[(i + 1) % this.vertices.length],
          i,
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
    return v
      .clone()
      .set(
        prev.x + v.x * f + next.x,
        prev.y + v.y * f + next.y,
        prev.z + v.z * f + next.z,
      )
      .multiplyScalar(1 / (2 + f)) // might not be multiply, but add, not sure
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

  public isConvexVertex(p2: Vector3): boolean {
    let p1 = this.prev(p2)
    let p3 = this.next(p2)
    return (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x) > 0
  }

  public isConvex(): boolean {
    const n = this.vertices.length

    if (n < 3) {
      return false // A polygon must have at least 3 points
    }

    let prevCrossProduct = 0
    for (let i = 0; i < n; i++) {
      const p1 = this.vertices[i]
      const p2 = this.vertices[(i + 1) % n]
      const p3 = this.vertices[(i + 2) % n]

      const crossProduct =
        (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x)

      if (i > 0 && crossProduct * prevCrossProduct < 0) {
        return false // If the cross products have different signs, the polygon is not convex
      }

      prevCrossProduct = crossProduct
    }

    return true
  }

  public vector(v: Vector3) {
    return this.next(v).clone().sub(v)
  }

  public vectorByIndex(i: number) {
    return this.vertices[i == this.vertices.length - 1 ? 0 : i + 1]
      .clone()
      .sub(this.vertices[i])
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

  public getLongestEdge() {
    return this.minPredicate(v => -this.vector(v).length())
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
    const newVertices = []
    this.forEdge((v1, v2, index) => {
      let dd = d[index]
      if (dd > 0) {
        let v = v2.clone().sub(v1)
        let n = normalize(perpendicular(v), dd)
        const p1 = v1.clone().add(n)
        const p2 = v2.clone().add(n)
        newVertices.push(p1, p2)
      }
    })
    return new Polygon(newVertices)
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
    const offset = new Vector3(dx, dy, 0)
    for (let v of this.vertices) {
      v.add(offset)
    }
  }

  public insetPolygonEdgeByVertex(v1: Vector3, gapSize: number): Polygon {
    const startVertexIndex = this.vertices.indexOf(v1)
    const vertices = [...this.vertices] // Make a copy of the original vertices to avoid modifying the original polygon

    // Find the indices of the previous and next vertices
    const prevIndex =
      startVertexIndex === 0 ? vertices.length - 1 : startVertexIndex - 1
    const nextIndex =
      startVertexIndex === vertices.length - 1 ? 0 : startVertexIndex + 1

    // Calculate the vectors representing the previous and next edges
    const prevEdge = v1.clone().sub(this.prev(v1))

    // this.prev(v1)
    // {
    //   x: vertices[startVertexIndex].x - vertices[prevIndex].x,
    //   y: vertices[startVertexIndex].y - vertices[prevIndex].y,
    // }
    const nextEdge = v1.clone().sub(this.next(v1))

    // {
    //   x: vertices[nextIndex].x - vertices[startVertexIndex].x,
    //   y: vertices[nextIndex].y - vertices[startVertexIndex].y,
    // }

    // Calculate the perpendicular vectors to the previous and next edges
    const prevPerpendicular = { x: -prevEdge.y, y: prevEdge.x }
    const nextPerpendicular = { x: -nextEdge.y, y: nextEdge.x }

    // Normalize the perpendicular vectors to unit length
    const prevPerpLength = Math.sqrt(
      prevPerpendicular.x * prevPerpendicular.x +
        prevPerpendicular.y * prevPerpendicular.y,
    )
    const nextPerpLength = Math.sqrt(
      nextPerpendicular.x * nextPerpendicular.x +
        nextPerpendicular.y * nextPerpendicular.y,
    )
    const prevUnit = {
      x: prevPerpendicular.x / prevPerpLength,
      y: prevPerpendicular.y / prevPerpLength,
    }
    const nextUnit = {
      x: nextPerpendicular.x / nextPerpLength,
      y: nextPerpendicular.y / nextPerpLength,
    }

    // Calculate the gap vectors for the previous and next edges
    const prevGap = { x: prevUnit.x * gapSize, y: prevUnit.y * gapSize }
    const nextGap = { x: nextUnit.x * gapSize, y: nextUnit.y * gapSize }

    // Calculate the new vertices for the start vertex, previous vertex, and next vertex
    vertices[startVertexIndex] = new Vector3(
      vertices[startVertexIndex].x + prevGap.x + nextGap.x,
      vertices[startVertexIndex].y + prevGap.y + nextGap.y,
      0,
    )
    vertices[prevIndex] = new Vector3(
      vertices[prevIndex].x + prevGap.x,
      vertices[prevIndex].y + prevGap.y,
    )
    vertices[nextIndex] = new Vector3(
      vertices[nextIndex].x + nextGap.x,
      vertices[nextIndex].y + nextGap.y,
    )

    // Return the new polygon with the inset edge
    return new Polygon(vertices)
  }

  // A version of "shrink" function for insetting just one edge.
  // It effectively cuts a peel along the edge.
  // TODO this should be more accurate instead of using the silly multiply scalar hack
  public peel(v1: Vector3, d: number): Polygon {
    const v2 = this.next(v1)

    const v = v2.clone().sub(v1)
    const n = normalize(perpendicular(v), d)

    const start = v1.clone().add(n)
    const end = v2.clone().add(n)

    const startDirection = new Vector3().subVectors(start, end).normalize()
    const endDirection = new Vector3().subVectors(end, start).normalize()

    // add some extra room to flubb the calculations, otherwise because of the angle the may end up inside the polygon
    start.add(startDirection.multiplyScalar(100))
    end.add(endDirection.multiplyScalar(100))

    const polygons = this.cut(start, end, 0)

    return polygons[0]
  }

  public cut(p1: Vector3, p2: Vector3, gap = 0): Array<Polygon> {
    return splitPolygon(this, { start: p1, end: p2 }, gap)
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
        let v = v1.clone().sub(v0)
        let n = normalize(perpendicular(v), dd)
        q.vertices.push(v0.clone().add(n))
        q.vertices.push(v1.clone().add(n))
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

  public static boundingBoxFromPolygons(polygons: Array<Polygon>): Polygon {
    let min = new Vector3(Infinity, Infinity, Infinity)
    let max = new Vector3(-Infinity, -Infinity, -Infinity)
    polygons.forEach(p => {
      p.vertices.forEach(v => {
        min.min(v)
        max.max(v)
      })
    })
    return new Polygon([
      new Vector3(min.x, min.y, 0),
      new Vector3(max.x, min.y, 0),
      new Vector3(max.x, max.y, 0),
      new Vector3(min.x, max.y, 0),
    ])
  }
}
