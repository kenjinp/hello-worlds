import { random } from "@hello-worlds/core"
import { Vector3 } from "three"

export const DAY = 86_400_000
export const km = 1_000
export const AU = 149_597_870_700
export const MOON_DISTANCE = 384_400 * km
export const SUN_RADIUS = 696_000 * km
export const EARTH_RADIUS = 6_357 * km
export const MARS_RADIUS = 3_389.5 * km
export const MOON_RADIUS = 1_737.4 * km
export const CERES_RADIUS = 469.73 * km

// Smooth minimum of two values, controlled by smoothing factor k
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

export function getRndBias(
  min: number,
  max: number,
  bias: number,
  influence: number,
) {
  let rnd = random() * (max - min) + min, // random in range
    mix = random() * influence // random mixer
  return rnd * (1 - mix) + bias * mix // mix full range and bias
}

export function bias(x: number, bias: number) {
  const k = Math.pow(1 - bias, 3)
  return (x * k) / (x * k - x + 1)
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
