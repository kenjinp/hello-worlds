import { MathUtils, Vector3 } from "three";

export function vectorTo(pos1: Vector3, pos2: Vector3) {
  return pos1.clone().sub(pos2);
}

export function smoothMin(a: number, b: number, k: number) {
  k = Math.max(0, k);
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)));
  return a * h + b * (1 - h) - k * h * (1 - h);
}

// Smooth maximum of two values, controlled by smoothing factor k
// When k = 0, this behaves identically to max(a, b)
export function smoothMax(a: number, b: number, k: number) {
  k = Math.min(0, -k);
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)));
  return a * h + b * (1 - h) - k * h * (1 - h);
}

export function smootherstep(edge0: number, edge1: number, x: number) {
  // Scale, and clamp x to 0..1 range
  x = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  // Evaluate polynomial
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function expStep(x: number, k: number, n: number) {
  return Math.exp(-k * Math.pow(x, n));
}

export function remap(
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
}

export function greatCircleDistance(a: Vector3, b: Vector3, radius: number) {
  const distance = Math.sqrt(
    (b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2
  );
  const phi = Math.asin(distance / 2 / radius);
  return 2 * phi * radius;
}
