import { Vector3 } from "three";

export type LongLat = [number, number];
export type LatLong = [number, number];

const RAD2DEG = 180 / Math.PI;
const tempVec3 = new Vector3();

export function sat(x: number) {
  return Math.min(Math.max(x, 0.0), 1.0);
}

export function polarToCartesian(
  lat: number,
  long: number,
  radius: number
): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - long) * Math.PI) / 180;

  return tempVec3
    .set(
      radius * Math.sin(phi) * Math.cos(theta), // x
      radius * Math.cos(phi), // y
      radius * Math.sin(phi) * Math.sin(theta) // z
    )
    .clone();
}

export function longLatToCartesian(longLat: LongLat, radius: number) {
  return polarToCartesian(longLat[0], longLat[1], radius);
}

export function cartesianToPolar(coordinates: Vector3): LongLat {
  const lon = Math.atan2(coordinates.x, coordinates.z) * RAD2DEG;
  const length = Math.sqrt(
    coordinates.x * coordinates.x + coordinates.z * coordinates.z
  );
  const lat = Math.atan2(coordinates.y, length) * RAD2DEG;

  return [lon, lat];
}

// herm herm
// export function addGreatCircleDistanceToPolar(
//   startingLongLat: LongLat,
//   distanceLong: number,
//   distanceLat: number,
//   radius: number
// ) {
//   const [long, lat] = startingLongLat;
//   const phi = ((90 - lat) * Math.PI) / 180;
//   const theta = ((90 - long) * Math.PI) / 180;

// }

export function fibonacciSphere(
  numberOfPoints: number,
  jitter: number,
  randFloat: () => number
): LongLat[] {
  const longLat: LongLat[] = [];
  const randomLat = [];
  const randomLong = [];
  // Second algorithm from http://web.archive.org/web/20120421191837/http://www.cgafaq.info/wiki/Evenly_distributed_points_on_sphere
  const s = 3.6 / Math.sqrt(numberOfPoints);
  const dlong = Math.PI * (3 - Math.sqrt(5)); /* ~2.39996323 */
  const dz = 2.0 / numberOfPoints;
  for (
    let k = 0, long = 0, z = 1 - dz / 2;
    k !== numberOfPoints;
    k++, z -= dz
  ) {
    const r = Math.sqrt(1 - z * z);
    let latDeg = (Math.asin(z) * 180) / Math.PI;
    let lonDeg = (long * 180) / Math.PI;
    if (randomLat[k] === undefined) randomLat[k] = randFloat() - randFloat();
    if (randomLong[k] === undefined) randomLong[k] = randFloat() - randFloat();
    latDeg +=
      jitter *
      randomLat[k] *
      (latDeg -
        (Math.asin(Math.max(-1, z - (dz * 2 * Math.PI * r) / s)) * 180) /
          Math.PI);
    lonDeg += jitter * randomLong[k] * (((s / r) * 180) / Math.PI);
    longLat.push([lonDeg % 360.0, latDeg]);
    long += dlong;
  }
  return longLat;
}
