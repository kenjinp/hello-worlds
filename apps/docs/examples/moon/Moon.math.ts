import { Sphere, Vector2, Vector3 } from "three"

const tempVec2 = new Vector2()
export function projectSquareOntoSphere(
  vector3: Vector3,
  squareSize: number,
  sphere: Sphere,
  squareCenter: Vector3,
): Vector2 | null {
  // Calculate the vector from the sphere center to the vector3
  const vectorToVector3: Vector3 = vector3.sub(sphere.center)

  // Calculate the distance from the sphere center to the vector3
  const distance = Math.sqrt(
    vectorToVector3.x ** 2 + vectorToVector3.y ** 2 + vectorToVector3.z ** 2,
  )

  // Check if the vector3 is within the sphere (distance <= sphereRadius)
  if (distance > sphere.radius) {
    return null
  }

  // Normalize the vector from the sphere center to the vector3
  const normalizedVector: Vector3 = vectorToVector3.divideScalar(sphere.radius)

  // Calculate the vector from the sphere center to the square center
  const vectorToSquareCenter: Vector3 = squareCenter.sub(sphere.center)

  // Normalize the vector from the sphere center to the square center
  const normalizedSquareCenter: Vector3 = vectorToSquareCenter.divideScalar(
    sphere.radius,
  )

  // Calculate the cross product of the normalized vectors to find the "up" direction
  const up = {
    x:
      normalizedVector.y * normalizedSquareCenter.z -
      normalizedVector.z * normalizedSquareCenter.y,
    y:
      normalizedVector.z * normalizedSquareCenter.x -
      normalizedVector.x * normalizedSquareCenter.z,
    z:
      normalizedVector.x * normalizedSquareCenter.y -
      normalizedVector.y * normalizedSquareCenter.x,
  }

  // Calculate the "right" direction using the cross product of the "up" and normalized vectors
  const right = {
    x: up.y * normalizedVector.z - up.z * normalizedVector.y,
    y: up.z * normalizedVector.x - up.x * normalizedVector.z,
    z: up.x * normalizedVector.y - up.y * normalizedVector.x,
  }

  // Calculate the vector3 relative to the square center
  const relativeVector3 = {
    x: normalizedVector.x - normalizedSquareCenter.x,
    y: normalizedVector.y - normalizedSquareCenter.y,
    z: normalizedVector.z - normalizedSquareCenter.z,
  }

  // Calculate the UV coordinates
  const u =
    0.5 +
    (relativeVector3.x * right.x +
      relativeVector3.y * right.y +
      relativeVector3.z * right.z) /
      squareSize
  const v =
    0.5 -
    (relativeVector3.x * up.x +
      relativeVector3.y * up.y +
      relativeVector3.z * up.z) /
      squareSize

  // Check if the vector3 is within the projected square
  if (Math.abs(u - 0.5) <= 0.5 && Math.abs(v - 0.5) <= 0.5) {
    return tempVec2.set(u, v)
  }

  return null
}
