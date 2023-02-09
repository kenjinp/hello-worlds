import { MathUtils, Vector3 } from "three"

const _D = new Vector3()
const _P = new Vector3()

export const fixEdgeSkirt = (
  resolution: number,
  positions: number[],
  up: number[],
  normals: number[],
  width: number,
  size: number,
  inverted: boolean,
) => {
  const effectiveResolution = resolution + 2

  const _ApplyFix = (x: number, y: number, xp: number, yp: number) => {
    const skirtIndex = x * (effectiveResolution + 1) + y
    const proxyIndex = xp * (effectiveResolution + 1) + yp

    _P.fromArray(positions, proxyIndex * 3)
    _D.fromArray(up, proxyIndex * 3)

    // pull skirt down
    // The skirt size is set by the size of the chunk, but experimentally it creates crazy spikes if it's not clamped.
    const skirtSize = MathUtils.clamp(width, 0, size / 10)
    _D.multiplyScalar(inverted ? skirtSize : -skirtSize)
    _P.add(_D)

    positions[skirtIndex * 3 + 0] = _P.x
    positions[skirtIndex * 3 + 1] = _P.y
    positions[skirtIndex * 3 + 2] = _P.z

    normals[skirtIndex * 3 + 0] = normals[proxyIndex * 3 + 0]
    normals[skirtIndex * 3 + 1] = normals[proxyIndex * 3 + 1]
    normals[skirtIndex * 3 + 2] = normals[proxyIndex * 3 + 2]
  }

  for (let y = 0; y <= effectiveResolution; ++y) {
    _ApplyFix(0, y, 1, y)
  }
  for (let y = 0; y <= effectiveResolution; ++y) {
    _ApplyFix(effectiveResolution, y, effectiveResolution - 1, y)
  }
  for (let x = 0; x <= effectiveResolution; ++x) {
    _ApplyFix(x, 0, x, 1)
  }
  for (let x = 0; x <= effectiveResolution; ++x) {
    _ApplyFix(x, effectiveResolution, x, effectiveResolution - 1)
  }
}
