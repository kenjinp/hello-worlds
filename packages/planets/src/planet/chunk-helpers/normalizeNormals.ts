import { Vector3 } from "three"

const _N = new Vector3()

export const normalizeNormals = (normals: number[]) => {
  for (let i = 0, n = normals.length; i < n; i += 3) {
    _N.fromArray(normals, i)
    _N.normalize()
    normals[i] = _N.x
    normals[i + 1] = _N.y
    normals[i + 2] = _N.z
  }
  return normals
}
