import * as THREE from "three";
import Noise from "../noise/Noise";
import { Generator3 } from "./Generator3";

export interface HeightGeneratorParams {
  generator: Noise;
  offset: THREE.Vector3;
  minRadius: number;
  maxRadius: number;
}

export class HeightGenerator implements Generator3<[number, number]> {
  position: THREE.Vector3;
  radius: [number, number];
  constructor(private params: HeightGeneratorParams) {
    this.position = this.params.offset.clone();
    this.radius = [params.minRadius, params.maxRadius];
  }

  get(x: number, y: number, z: number) {
    return [this.params.generator.get(x, y, z), 1] as [number, number];
  }
}
