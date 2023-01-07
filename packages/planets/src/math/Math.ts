// Smooth minimum of two values, controlled by smoothing factor k

import { random } from "@hello-worlds/core"
import { Mesh, Quaternion, Vector3 } from "three"
import { tempVector3 } from "../utils"

// When k = 0, this behaves identically to min(a, b)
export function smoothMin(a: number, b: number, k: number) {
  k = Math.max(0, k)
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)))
  return a * h + b * (1 - h) - k * h * (1 - h)
}

// Smooth maximum of two values, controlled by smoothing factor k
// When k = 0, this behaves identically to max(a, b)
export function smoothMax(a: number, b: number, k: number) {
  k = Math.min(0, -k)
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)))
  return a * h + b * (1 - h) - k * h * (1 - h)
}

export function randomSpherePoint(
  x0: number,
  y0: number,
  z0: number,
  radius: number,
) {
  let u = random()
  let v = random()
  let theta = 2 * Math.PI * u
  let phi = Math.acos(2 * v - 1)
  let x = x0 + radius * Math.sin(phi) * Math.cos(theta)
  let y = y0 + radius * Math.sin(phi) * Math.sin(theta)
  let z = z0 + radius * Math.cos(phi)
  return new Vector3(x, y, z)
}

export function randomSpherePointVector3(origin: Vector3, radius: number) {
  const { x: x0, y: y0, z: z0 } = origin
  let u = random()
  let v = random()
  let theta = 2 * Math.PI * u
  let phi = Math.acos(2 * v - 1)
  let x = x0 + radius * Math.sin(phi) * Math.cos(theta)
  let y = y0 + radius * Math.sin(phi) * Math.sin(theta)
  let z = z0 + radius * Math.cos(phi)
  return new Vector3(x, y, z)
}

// from https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/
export const randomNormals = () => {
  let u = 1 - random() //Converting [0,1) to (0,1)
  let v = random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export const randomSkewNormal = (min: number, max: number, skew = 0) => {
  let u = 0,
    v = 0
  while (u === 0) u = random() //Converting [0,1) to (0,1)
  while (v === 0) v = random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randomSkewNormal(min, max, skew)
  // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}

export function bias(x: number, bias: number) {
  const k = Math.pow(1 - bias, 3)
  return (x * k) / (x * k - x + 1)
}

// from https://stackoverflow.com/questions/29325069/how-to-generate-random-numbers-biased-towards-one-value-in-a-range
export function getRandomBias(
  min: number,
  max: number,
  bias: number,
  influence: number,
) {
  let rnd = Math.random() * (max - min) + min, // random in range
    mix = Math.random() * influence // random mixer
  return rnd * (1 - mix) + bias * mix // mix full range and bias
}

export function remap(
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2
}

export function normalizeAsCylinder(input: Vector3, radius: number) {
  // bend cube into cylinder
  const cylinderLength = Math.sqrt(input.x * input.x + input.z * input.z)
  // this is esentially normalizing the vector, but without the y component
  input.divide(tempVector3.set(cylinderLength, 1, cylinderLength))
  // push out the points across the circle at radius
  return input.multiply(tempVector3.set(radius, 1, radius))
}

export function orientMesh(mesh: Mesh, targetDirection: Vector3) {
  // Get the current direction of the mesh
  const currentDirection = mesh.getWorldDirection(new Vector3())

  // Calculate the rotation needed to align the mesh with the target direction
  const quaternion = new Quaternion().setFromUnitVectors(
    currentDirection,
    targetDirection,
  )

  // Rotate the mesh to the target direction
  mesh.applyQuaternion(quaternion)
}

export function moduloVector3(vec3: Vector3, value: number) {
  vec3.x = vec3.x - value * Math.floor(vec3.x / value)
  vec3.y = vec3.y - value * Math.floor(vec3.y / value)
  vec3.z = vec3.z - value * Math.floor(vec3.z / value)
  return vec3
}
