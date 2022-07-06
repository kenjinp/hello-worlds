import {
  Color,
  DoubleSide,
  Float32BufferAttribute,
  IcosahedronBufferGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from "three";
import Noise from "../noise/Noise";
import { DEFAULT_NOISE_PARAMS } from "../planet/PlanetEngine";

export interface GeologyProps {
  seed?: string | number;
  tectonicPlateCount?: number;
  subdivisions?: number;
  radius: number;
}

export type TileMap = Record<string, { isOcean: boolean; point: number[] }>;

const placeholderVector = new Vector3();
export const getClosestTile = (v: THREE.Vector3, tileMap: TileMap) => {
  let smallestDistance: number | undefined = undefined;
  let smallestDistanceKey = "";
  for (let key in tileMap) {
    const [x, y, z] = key.split(".");
    const tileMapVector = placeholderVector.set(
      Number(x),
      Number(y),
      Number(z)
    );
    const dist = v.distanceTo(tileMapVector);
    if (smallestDistance === undefined) {
      smallestDistance = dist;
      smallestDistanceKey = key;
    } else if (dist < smallestDistance) {
      smallestDistance = dist;
      smallestDistanceKey = key;
    }
  }
  return {
    tile: tileMap[smallestDistanceKey],
    dist: smallestDistance,
  };
};

const DEFAULT_SUBDIVISIONS = 0;

export default class Geology {
  public mesh: Mesh;
  public geometry: IcosahedronBufferGeometry;
  public material: Material;
  public tileMap: TileMap;
  constructor(public props: GeologyProps) {
    const { radius, subdivisions = DEFAULT_SUBDIVISIONS } = props;
    this.geometry = new IcosahedronBufferGeometry(radius, subdivisions);
    this.material = new MeshBasicMaterial({
      wireframe: true,
      wireframeLinewidth: 5,
      color: 0xffffff,
      side: DoubleSide,
      vertexColors: true,
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.tileMap = {};
    this.rebuild(props);
  }

  rebuild(props: GeologyProps) {
    const { radius, subdivisions = DEFAULT_SUBDIVISIONS } = props;
    this.geometry = new IcosahedronBufferGeometry(radius, subdivisions);
    this.mesh.geometry = this.geometry;
    const noise = new Noise({
      ...DEFAULT_NOISE_PARAMS,
      scale: 4_000 * 2,
      height: 1,
    });
    // this.mesh.visible = false;
    const points = this.geometry.getAttribute("position").array;
    console.log(points, this.geometry.index);
    const oceanColor = new Color().setRGB(66 / 255, 135 / 255, 245 / 255);
    const groundColor = new Color().setRGB(54 / 255, 247 / 255, 54 / 255);
    const colors = new Float32Array(points.length);
    const colorVertexMap: Record<string, number[]> = {};
    this.tileMap = {};
    for (let i = 0, n = points.length; i < n; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];
      const color = colorVertexMap[`${x}.${y}.${z}`];
      const noiseAtPoint = noise.get(x, y, z);
      if (!color) {
        const isOcean = noiseAtPoint >= 0.05;
        const vertexColor = isOcean ? oceanColor : groundColor;
        colorVertexMap[`${x}.${y}.${z}`] = [
          vertexColor.r,
          vertexColor.g,
          vertexColor.b,
        ];
        this.tileMap[`${x}.${y}.${z}`] = {
          isOcean,
          point: [x, y, z],
        };
        vertexColor.toArray(colors, i);
      } else {
        colors[i] = color[0];
        colors[i + 1] = color[1];
        colors[i + 2] = color[2];
      }
    }
    this.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  }
}
