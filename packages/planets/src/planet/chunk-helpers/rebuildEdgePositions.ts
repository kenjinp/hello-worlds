import { Vector3 } from "three"
import { ChunkGeneratorProps, HeightGenerator } from "../../chunk/types"

const _D = new Vector3()
const _D1 = new Vector3()
const _D2 = new Vector3()
const _P = new Vector3()
const _P1 = new Vector3()
const _P2 = new Vector3()
const _P3 = new Vector3()
const _H = new Vector3()
const _W = new Vector3()
const _S = new Vector3()
const _C = new Vector3()

const _N = new Vector3()
const _N1 = new Vector3()
const _N2 = new Vector3()
const _N3 = new Vector3()

export interface RebuildEdgePositionProps<D> extends ChunkGeneratorProps<D> {
  heightGenerator: HeightGenerator<D>
}

;<T>(x: T) => x

export const rebuildEdgePositions = <D>(
  params: RebuildEdgePositionProps<D>,
  positions: number[],
) => {
  const {
    resolution,
    radius,
    worldMatrix,
    offset,
    width,
    origin,
    data,
    inverted,
    heightGenerator,
  } = params

  const localToWorld = worldMatrix
  const half = width / 2
  const effectiveResolution = resolution - 2

  const computeOriginOffsetPosition = (xpos: number, ypos: number) => {
    const xp = width * xpos
    const yp = width * ypos
    _P.set(xp - half, yp - half, radius)
    _P.add(offset)
    _P.normalize()
    _D.copy(_P)
    _D.transformDirection(localToWorld)

    _P.multiplyScalar(radius)
    _P.z -= radius
    _P.applyMatrix4(localToWorld)

    // Keep the absolute world space position to sample noise
    _W.copy(_P)

    // Move the position relative to the origin
    _P.sub(origin)

    // Purturb height along z-vector
    const height = heightGenerator({
      input: _P,
      worldPosition: _P,
      radius,
      offset,
      width,
      worldMatrix,
      resolution,
      origin,
      inverted,
      data,
    })
    _H.copy(_D)
    _H.multiplyScalar(height)
    _P.add(_H)

    return _P
  }

  let x = 1
  for (let z = 1; z <= resolution - 1; z++) {
    const i = x * (resolution + 1) + z
    const p = computeOriginOffsetPosition(
      (x - 1) / effectiveResolution,
      (z - 1) / effectiveResolution,
    )
    positions[i * 3 + 0] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
  }

  let z = resolution - 1
  for (let x = 1; x <= resolution - 1; x++) {
    const i = x * (resolution + 1) + z
    const p = computeOriginOffsetPosition(
      (x - 1) / effectiveResolution,
      (z - 1) / effectiveResolution,
    )
    positions[i * 3 + 0] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
  }

  x = resolution - 1
  for (let z = 1; z <= resolution - 1; z++) {
    const i = x * (resolution + 1) + z
    const p = computeOriginOffsetPosition(
      (x - 1) / effectiveResolution,
      (z - 1) / effectiveResolution,
    )
    positions[i * 3 + 0] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
  }

  z = 1
  for (let x = 1; x <= resolution - 1; x++) {
    const i = x * (resolution + 1) + z
    const p = computeOriginOffsetPosition(
      (x - 1) / effectiveResolution,
      (z - 1) / effectiveResolution,
    )
    positions[i * 3 + 0] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
  }
  return positions
}
