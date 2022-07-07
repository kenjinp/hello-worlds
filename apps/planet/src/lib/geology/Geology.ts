import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  FrontSide,
  IcosahedronBufferGeometry,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from "three";
import Noise from "../noise/Noise";
import { DEFAULT_NOISE_PARAMS } from "../planet/PlanetEngine";
import { EdgeHelper } from "./helpers";

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

const DEFAULT_SUBDIVISIONS = 10;

export default class Geology {
  public mesh: Mesh;
  public geometry: BufferGeometry;
  public material: Material;
  public tileMap: TileMap;
  public edgeHelper: EdgeHelper;
  constructor(public props: GeologyProps) {
    const { radius, subdivisions = DEFAULT_SUBDIVISIONS } = props;
    this.geometry = new IcosahedronBufferGeometry(radius, subdivisions);
    this.material = new MeshBasicMaterial({
      // wireframe: true,
      // wireframeLinewidth: 5,
      color: 0xffffff,
      side: FrontSide,
      vertexColors: true,
    });
    this.edgeHelper = new EdgeHelper(this.geometry);
    this.mesh = new Mesh(this.geometry, this.material);
    this.tileMap = {};
    this.rebuild(props);
  }

  rebuild(props: GeologyProps) {
    const { radius, subdivisions = DEFAULT_SUBDIVISIONS } = props;
    this.geometry = new IcosahedronBufferGeometry(radius, subdivisions);
    this.mesh.geometry = this.geometry;
    this.edgeHelper = new EdgeHelper(this.geometry);
    this.randomFloodFill();
    const noise = new Noise({
      ...DEFAULT_NOISE_PARAMS,
      scale: 4_000 * 2,
      height: 1,
    });
    const points = this.geometry.getAttribute("position").array;
    const oceanColor = new Color().setRGB(66 / 255, 135 / 255, 245 / 255);
    const groundColor = new Color().setRGB(54 / 255, 247 / 255, 54 / 255);
    const colors = new Float32Array(points.length);
    for (let edgeIndex in this.edgeHelper.edges) {
      const edge = this.edgeHelper.edges[edgeIndex];
      const { x, y, z } = edge.vertex;
      const noiseAtPoint = noise.get(x, y, z);
      const isOcean = noiseAtPoint >= 0.05;
      let vertexColor;
      if (edge.data.vertexColor) {
        vertexColor = edge.data.vertexColor;
      } else {
        vertexColor = isOcean ? oceanColor : groundColor;
        edge.data = {
          isOcean,
          vertexColor,
        };
      }

      vertexColor.toArray(colors, Number(edgeIndex) * 3);
    }
    this.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  }

  randomFloodFill(points = MathUtils.randInt(15, 20)) {
    for (let i = 0; i < points; i++) {
      const color = new Color(0xffffff);
      color.setHex(Math.random() * 0xffffff);
      this.edgeHelper.randomEdge.data = {
        vertexColor: color,
      };
    }
  }
}
