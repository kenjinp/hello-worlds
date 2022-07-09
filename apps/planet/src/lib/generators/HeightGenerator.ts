import { Vector3 } from "three";
import Noise from "../noise/Noise";
import { Generator3 } from "./Generator3";

export interface HeightGeneratorParams {
  generator: Noise;
  // offset: THREE.Vector3;
  // geology: Geology;
  // minRadius: number;
  // maxRadius: number;
  // tileMap: TileMap;
}
const thingy = new Vector3();
export class HeightGenerator implements Generator3<[number, number]> {
  // position: THREE.Vector3;
  // radius: [number, number];
  noise = new Noise({
    octaves: 13,
    persistence: 0.707,
    lacunarity: 1.8,
    exponentiation: 4.5,
    seed: 1,
    noiseType: "simplex",
    scale: 4_000 * 2,
    height: 75,
  });

  constructor(private params: HeightGeneratorParams) {
    // this.position = this.params.offset.clone();
    // this.radius = [params.minRadius, params.maxRadius]
  }

  get(x: number, y: number, z: number) {
    // TODO this value shall be attenuated by GEOLOGY
    let val = this.params.generator.get(x, y, z);
    let noiseAtPoint = this.noise.get(x, y, z);
    // const h = z / 100;
    // const isOcean = noiseAtPoint >= 0.05;
    // noiseAtPoint += val;
    if (noiseAtPoint > 3) {
      noiseAtPoint += val;
    }

    // blend stuff
    // random noise for things like cliffs
    // a higher noise based on the already used continental noise

    return [noiseAtPoint, 0] as [number, number];
  }
}
