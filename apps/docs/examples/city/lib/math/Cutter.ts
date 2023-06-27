import { Vector3 } from "three"
import { Polygon, normalize, perpendicular } from "./Polygon"

export function bisect(
  poly: Polygon,
  vertex: Vector3,
  ratio = 0.5,
  angle = 0.0,
  gap = 0.0,
): Array<Polygon> {
  let next = poly.next(vertex)

  let p1 = vertex.clone().lerp(next, ratio)
  let d = next.clone().sub(vertex)

  let cosB = Math.cos(angle)
  let sinB = Math.sin(angle)
  let vx = d.x * cosB - d.y * sinB
  let vy = d.y * cosB + d.x * sinB
  let p2 = new Vector3(p1.x - vy, p1.y + vx, 0)

  return poly.cut(p1, p2, gap)
}

export function ring(poly: Polygon, thickness: number): Array<Polygon> {
  let slices: {
    p1: Vector3
    p2: Vector3
    len: number
  }[] = []
  poly.forEdge((v1, v2) => {
    let v = v2.clone().sub(v1)
    let n = normalize(perpendicular(v), thickness)
    slices.push({
      p1: v1.clone().add(n),
      p2: v2.clone().add(n),
      len: v.length(),
    })
  })

  // Short sides should be sliced first
  slices.sort((s1, s2) => s1.len - s2.len)

  const peel: Array<Polygon> = []

  let p = poly
  for (let i = 0; i < slices.length; i++) {
    let halves = p.cut(slices[i].p1, slices[i].p2)
    p = halves[0]
    if (halves.length == 2) peel.push(halves[1])
  }

  return peel
}

export function radial(
  poly: Polygon,
  center: Vector3 = null,
  gap = 0.0,
): Array<Polygon> {
  if (!center) {
    center = poly.centroid
  }

  const sectors: Array<Polygon> = []
  poly.forEdge((v0, v1) => {
    let sector = new Polygon([center, v0, v1])
    if (gap > 0) {
      sector = sector.shrink([gap / 2, 0, gap / 2])
    }
    sectors.push(sector)
  })
  return sectors
}

export function semiRadial(
  poly: Polygon,
  center: Vector3 = null,
  gap = 0.0,
): Array<Polygon> {
  if (!center) {
    const centroid = poly.centroid
    center = poly.minPredicate(v => v.distanceTo(centroid))
  }

  gap /= 2

  const sectors: Array<Polygon> = []
  poly.forEdge((v0, v1) => {
    if (!v0.equals(center) && !v1.equals(center)) {
      let sector = new Polygon([center, v0, v1])
      if (gap > 0) {
        const d = [
          poly.findEdge(center, v0) == -1 ? gap : 0,
          0,
          poly.findEdge(v1, center) == -1 ? gap : 0,
        ]
        sector = sector.shrink(d)
      }
      sectors.push(sector)
    }
  })
  return sectors
}
