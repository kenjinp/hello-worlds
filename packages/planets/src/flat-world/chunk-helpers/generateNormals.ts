import { Vector3 } from "three"

const _N1 = new Vector3()
const _N2 = new Vector3()
const _N3 = new Vector3()

const _D1 = new Vector3()
const _D2 = new Vector3()

export const generateNormals = (
  normals: number[],
  positions: number[],
  indices: number[],
): number[] => {
  for (let i = 0, n = indices.length; i < n; i += 3) {
    const i1 = indices[i] * 3
    const i2 = indices[i + 1] * 3
    const i3 = indices[i + 2] * 3

    _N1.fromArray(positions, i1)
    _N2.fromArray(positions, i2)
    _N3.fromArray(positions, i3)

    _D1.subVectors(_N3, _N2)
    _D2.subVectors(_N1, _N2)
    _D1.cross(_D2)

    normals[i1] += _D1.x
    normals[i2] += _D1.x
    normals[i3] += _D1.x

    normals[i1 + 1] += _D1.y
    normals[i2 + 1] += _D1.y
    normals[i3 + 1] += _D1.y

    normals[i1 + 2] += _D1.z
    normals[i2 + 2] += _D1.z
    normals[i3 + 2] += _D1.z
  }
  return normals
}
