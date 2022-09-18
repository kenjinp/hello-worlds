import { Vector3 } from 'three';

export const km = 1_000;
export const AU = 149_597_870_700;
export const MOON_DISTANCE = 384_400 * km;
export const SUN_RADIUS = 696_000 * km;
export const EARTH_RADIUS = 6_357 * km;
export const MARS_RADIUS = 3_389.5 * km;
export const MOON_RADIUS = 1_737.4 * km;
export const CERES_RADIUS = 469.73 * km;

export function randomSpherePoint(x0: number, y0: number, z0: number, radius: number) {
  let u = Math.random();
  let v = Math.random();
  let theta = 2 * Math.PI * u;
  let phi = Math.acos(2 * v - 1);
  let x = x0 + radius * Math.sin(phi) * Math.cos(theta);
  let y = y0 + radius * Math.sin(phi) * Math.sin(theta);
  let z = z0 + radius * Math.cos(phi);
  return new Vector3(x,y,z);
}

export function getRndBias(min: number, max: number, bias: number, influence: number) {
  let rnd = Math.random() * (max - min) + min, // random in range
    mix = Math.random() * influence; // random mixer
  return rnd * (1 - mix) + bias * mix; // mix full range and bias
}

export function bias(x: number, bias: number) {
  const k = Math.pow(1 - bias, 3);
  return (x * k) / (x * k - x + 1);
}
