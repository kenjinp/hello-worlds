import { Vector3 } from "three";
import { TileMap } from "../geology/Geology";
import Noise from "../noise/Noise";
import { Generator3 } from "./Generator3";

export interface HeightGeneratorParams {
  generator: Noise;
  // offset: THREE.Vector3;
  // geology: Geology;
  // minRadius: number;
  // maxRadius: number;
  tileMap: TileMap;
}
const thingy = new Vector3();
export class HeightGenerator implements Generator3<[number, number]> {
  // position: THREE.Vector3;
  // radius: [number, number];
  constructor(private params: HeightGeneratorParams) {
    // this.position = this.params.offset.clone();
    // this.radius = [params.minRadius, params.maxRadius];
  }

  get(x: number, y: number, z: number) {
    // TODO this value shall be attenuated by GEOLOGY
    let val = this.params.generator.get(x, y, z);
    // thingy.set(x, y, z);
    // const closestPoint = getClosestTile(thingy.clone(), this.params.tileMap);
    // val += closestPoint.tile.isOcean ? -10 : 10;

    return [val, 0] as [number, number];
  }
}
