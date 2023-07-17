import { Crater } from "@game/generators/craters"
import { Vector3 } from "three"

// float sdBox( vec3 p, vec3 b )
// {
// vec3 q = abs(p) - b;
// return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
// }

const tempVec3 = new Vector3()
export function sdBox(position: Vector3, crater: Crater) {
  // vec2 d = Math.abs(p)-b;
  // box size = rx * ry
  const r = crater.center.clone().addScalar(crater.radius)

  const q = position.set(
    Math.abs(position.x),
    Math.abs(position.y),
    Math.abs(position.z),
  )

  q.x = Math.max(q.x, 0)
  q.y = Math.max(q.y, 0)
  q.y = Math.max(q.y, 0)
  return Math.sqrt(
    Math.pow(position.x - r.x, 2) + Math.pow(position.y - r.y, 2),
  )
  //   .sub(tempVec3.set(crater.radius, crater.radius, 0.0))
  // return Math.max(d.length(), 0.0) + Math.min(Math.max(d.x, d.y), 0.0)

  // const q = Math.abs(position) - crater.center;
  // return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
