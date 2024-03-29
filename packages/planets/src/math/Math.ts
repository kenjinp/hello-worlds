// Smooth minimum of two values, controlled by smoothing factor k

import { random } from "@hello-worlds/core"
import { Mesh, Quaternion, Vector3 } from "three"
import { tempVector3 } from "../utils"
import { LatLong } from "./LatLong"

export const DAY = 86_400_000
export const km = 1_000
export const AU = 149_597_870_700
export const MOON_DISTANCE = 384_400 * km
export const SUN_RADIUS = 696_000 * km
export const EARTH_RADIUS = 6_357 * km
export const MARS_RADIUS = 3_389.5 * km
export const MOON_RADIUS = 1_737.4 * km
export const TITAN_RADIUS = 2574.7 * km
export const CERES_RADIUS = 469.73 * km
export const C = 299_792_458

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
  vector = new Vector3(),
) {
  let u = random()
  let v = random()
  let theta = 2 * Math.PI * u
  let phi = Math.acos(2 * v - 1)
  let x = x0 + radius * Math.sin(phi) * Math.cos(theta)
  let y = y0 + radius * Math.sin(phi) * Math.sin(theta)
  let z = z0 + radius * Math.cos(phi)
  return vector.set(x, y, z)
}

export function randomSpherePointVector3(
  origin: Vector3,
  radius: number,
  target: Vector3 = new Vector3(),
): Vector3 {
  const { x: x0, y: y0, z: z0 } = origin
  let u = random()
  let v = random()
  let theta = 2 * Math.PI * u
  let phi = Math.acos(2 * v - 1)
  let x = x0 + radius * Math.sin(phi) * Math.cos(theta)
  let y = y0 + radius * Math.sin(phi) * Math.sin(theta)
  let z = z0 + radius * Math.cos(phi)
  target.set(x, y, z)
  return target
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

export function clampPointToSphereSurface(
  point: Vector3,
  sphereCenter: Vector3,
  sphereRadius: number,
) {
  const direction = point.clone().sub(sphereCenter).normalize()
  return direction.multiplyScalar(sphereRadius).add(sphereCenter)
}

// Generate random points on a sphere
export function fibonacciSphere(
  numberOfPoints: number,
  jitter: number,
  randFloat: () => number,
): LatLong[] {
  const latLong: LatLong[] = []
  const randomLat = []
  const randomLong = []
  // Second algorithm from http://web.archive.org/web/20120421191837/http://www.cgafaq.info/wiki/Evenly_distributed_points_on_sphere
  const s = 3.6 / Math.sqrt(numberOfPoints)
  const dlong = Math.PI * (3 - Math.sqrt(5)) /* ~2.39996323 */
  const dz = 2.0 / numberOfPoints
  for (
    let k = 0, long = 0, z = 1 - dz / 2;
    k !== numberOfPoints;
    k++, z -= dz
  ) {
    const r = Math.sqrt(1 - z * z)
    let latDeg = (Math.asin(z) * 180) / Math.PI
    let lonDeg = (long * 180) / Math.PI
    if (randomLat[k] === undefined) randomLat[k] = randFloat() - randFloat()
    if (randomLong[k] === undefined) randomLong[k] = randFloat() - randFloat()
    latDeg +=
      jitter *
      randomLat[k] *
      (latDeg -
        (Math.asin(Math.max(-1, z - (dz * 2 * Math.PI * r) / s)) * 180) /
          Math.PI)
    lonDeg += jitter * randomLong[k] * (((s / r) * 180) / Math.PI)
    latLong.push(new LatLong(latDeg, lonDeg % 360.0))
    long += dlong
  }
  return latLong
}
