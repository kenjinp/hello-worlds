import { Vector3 } from "three"
import { Polygon } from "./Polygon"

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
