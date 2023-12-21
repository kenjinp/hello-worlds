import { MathUtils, Vector3 } from "three"

const _D = new Vector3()
const _P = new Vector3()
const _N = new Vector3()
const _NP1 = new Vector3()
const _NP2 = new Vector3()

export const fixEdgeSkirt = (
  resolution: number,
  positions: number[],
  up: number[],
  normals: number[],
  width: number,
  size: number,
  skirtDepth: number,
  inverted: boolean,
) => {
  const effectiveResolution = resolution + 2
  const copyNormalsFromTopology = true

  const _ApplyFix = (
    x: number,
    y: number,
    xp: number,
    yp: number,
    normal: Vector3,
  ) => {
    const skirtIndex = x * (effectiveResolution + 1) + y
    const proxyIndex = xp * (effectiveResolution + 1) + yp

    _P.fromArray(positions, proxyIndex * 3)
    _D.fromArray(up, proxyIndex * 3)

    // pull skirt down
    // The skirt size is set by the size of the chunk, but experimentally it creates crazy spikes if it's not clamped.
    if (skirtDepth) {
      // Pull skirt down to an assigned depth
      _P.add(_D)
      _P.setZ(inverted ? skirtDepth : -skirtDepth)
    } else {
      // Pull skirt down based on chunk size
      const skirtSize = MathUtils.clamp(width, 0, size / 10)
      _D.multiplyScalar(inverted ? skirtSize : -skirtSize)
      _P.add(_D)
    }

    positions[skirtIndex * 3 + 0] = _P.x
    positions[skirtIndex * 3 + 1] = _P.y
    positions[skirtIndex * 3 + 2] = _P.z

    // this copies the normals from the other one, but what if we don't want that?
    if (copyNormalsFromTopology) {
      normals[skirtIndex * 3 + 0] = normals[proxyIndex * 3 + 0]
      normals[skirtIndex * 3 + 1] = normals[proxyIndex * 3 + 1]
      normals[skirtIndex * 3 + 2] = normals[proxyIndex * 3 + 2]
    } else {
      // calculate REAL normals

      // get skirt edge normal
      normals[skirtIndex * 3 + 0] = normal.x
      normals[skirtIndex * 3 + 1] = normal.y
      normals[skirtIndex * 3 + 2] = normal.z

      normals[proxyIndex * 3 + 0] = normal.x
      normals[proxyIndex * 3 + 1] = normal.y
      normals[proxyIndex * 3 + 2] = normal.z
    }
  }

  for (let y = 0; y <= effectiveResolution; ++y) {
    _ApplyFix(0, y, 1, y, new Vector3(1, 0, 0).random().normalize())
    _ApplyFix(
      effectiveResolution,
      y,
      effectiveResolution - 1,
      y,
      new Vector3(-1, 0, 0).random().normalize(),
    )

    // because this is a square, we can do this loop at the same time
    const x = y

    _ApplyFix(x, 0, x, 1, new Vector3(0, 0, 1).random().normalize())
    _ApplyFix(
      x,
      effectiveResolution,
      x,
      effectiveResolution - 1,
      new Vector3(0, 0, -1).random().normalize(),
    )
  }

  // for (let x = 0; x <= effectiveResolution; ++x) {
  //   _ApplyFix(x, 0, x, 1, new Vector3(0, 0, 1).random().normalize())
  //   _ApplyFix(
  //     x,
  //     effectiveResolution,
  //     x,
  //     effectiveResolution - 1,
  //     new Vector3(0, 0, -1).random().normalize(),
  //   )
  // }
}
