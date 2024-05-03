import { MathUtils, Vector3 } from "three"
import { tempVector3 } from "../../utils"

const _D = new Vector3()
const _P = new Vector3()
const _N = new Vector3()

const _U = new Vector3()
const _Center = new Vector3()
function getUpDirectionOnCylinder(
  position: Vector3,
  offset: Vector3,
): THREE.Vector3 {
  const up = _U
  const center = _Center.set(0, position.y, 0).add(offset)
  const direction = tempVector3.copy(position).sub(center)
  up.crossVectors(direction, tempVector3.set(0, 0, 1)).normalize()
  return up
}

function getCylinderNormal(
  position: Vector3,
  radius: number,
  inverted: boolean,
): Vector3 {
  // Vector from the cylinder center (at base height) to the point on the surface
  let pointAtBaseHeight = new Vector3(position.x, position.y, position.z)
  let radialVector = pointAtBaseHeight

  // Normalize the radial vector to get the normal

  // bend cube into cylinder
  const cylinderLength = Math.sqrt(
    radialVector.x * radialVector.x + radialVector.z * radialVector.z,
  )
  // this is esentially normalizing the vector, but without the y component
  const normal = radialVector.divide(
    tempVector3.set(cylinderLength, 1, cylinderLength),
  )
  // let normal = radialVector.normalize()

  // If invert is true, reverse the direction
  if (inverted) {
    normal.negate()
  }

  return normal
}

export const fixEdgeSkirt = (
  resolution: number,
  positions: number[],
  up: number[],
  normals: number[],
  width: number,
  radius: number,
  skirtDepth: number,
  inverted: boolean,
) => {
  const effectiveResolution = resolution + 2

  const _ApplyFix = (x: number, y: number, xp: number, yp: number) => {
    const skirtIndex = x * (effectiveResolution + 1) + y
    const proxyIndex = xp * (effectiveResolution + 1) + yp

    _P.fromArray(positions, proxyIndex * 3)
    _D.fromArray(up, proxyIndex * 3)
    _D.y = 0 // cylinders don't need y component
    _D.normalize()

    // pull skirt down
    const skirtSize = skirtDepth
      ? skirtDepth
      : MathUtils.clamp(width, 0, radius / 5)

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
