import { Vector3 } from 'three';
import { smoothMax, smoothMin } from "../WorldBuilder.math";

export type Crater = {
  floorHeight: number;
  radius: number;
  center: Vector3;
  rimWidth: number;
  rimSteepness: number;
  smoothness: number;
}

export const craterHeight = (input: Vector3, craters: Crater[]) => {
  let craterHeight = 0;
  for (let i = 0; i < craters.length; i++) {
    const { rimWidth, rimSteepness, smoothness } = craters[i];
    const currentPoint = craters[i];
    const floorHeight = currentPoint.floorHeight;
    const x = input.distanceTo(currentPoint.center) / currentPoint.radius;
    const cavity = x * x - 1;
    const rimX = Math.min(x - 1 - rimWidth, 0);
    const rim = rimSteepness * rimX * rimX;
    let craterShape = smoothMax(cavity, floorHeight, smoothness);
    craterShape = smoothMin(craterShape, rim, smoothness);
    craterHeight += craterShape * currentPoint.radius;
  }
  return craterHeight;
}