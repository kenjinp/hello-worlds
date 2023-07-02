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

const INIT_NUMBER = 271

export function hashUuid(uuid, n?: number) {
  const x = uuid
    .split("-")
    .reduce((a, b) => a ^ Number.parseInt(b, 16), INIT_NUMBER)
  return n ? x % n : x
}
