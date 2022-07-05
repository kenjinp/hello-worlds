import {
  Color,
  DoubleSide,
  Float32BufferAttribute,
  IcosahedronBufferGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
} from "three";
import Noise from "../noise/Noise";
import { DEFAULT_NOISE_PARAMS } from "../planet/PlanetEngine";

export interface GeologyProps {
  seed?: string | number;
  tectonicPlateCount?: number;
  subdivisions?: number;
  radius: number;
}

export default class Geology {
  public mesh: Mesh;
  public geometry: IcosahedronBufferGeometry;
  public material: Material;
  constructor(public props: GeologyProps) {
    const { radius, subdivisions = 100 } = props;
    const noise = new Noise({
      ...DEFAULT_NOISE_PARAMS,
      scale: radius * 2,
      height: 1,
      seed: "alina",
    });
    this.geometry = new IcosahedronBufferGeometry(radius, subdivisions);
    this.material = new MeshBasicMaterial({
      // wireframe: true,
      // wireframeLinewidth: 5,
      color: 0xffffff,
      side: DoubleSide,
      vertexColors: true,
    });
    this.mesh = new Mesh(this.geometry, this.material);
    const points = this.geometry.getAttribute("position").array;
    const oceanColor = new Color().setRGB(66 / 255, 135 / 255, 245 / 255);
    const groundColor = new Color().setRGB(54 / 255, 247 / 255, 54 / 255);
    const colors = new Float32Array(points.length);
    const colorVertexMap: Record<string, number[]> = {};
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
        vertexColor.toArray(colors, i);
      } else {
        colors[i] = color[0];
        colors[i + 1] = color[1];
        colors[i + 2] = color[2];
      }
    }
    console.log(colorVertexMap);
    this.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  }
}
