import * as THREE from "three";
import { MathUtils } from "three";
import { Noise } from "../noise/Noise";
import { Lerp, LinearSpline } from "../spline/LinearSpline";
import { Generator3 } from "./Generator3";

const colorLerp: Lerp<THREE.Color> = (
  t: number,
  p0: THREE.Color,
  p1: THREE.Color
) => {
  const c = p0.clone();
  return c.lerp(p1, t);
};

export interface ColorGeneratorParams {
  biomeGenerator: Noise;
  seaDeep: string;
  seaMid: string;
  seaShallow: string;
  tempHot: string;
  tempMid: string;
  tempCold: string;
  humidLow: string;
  humidMid: string;
  humidHigh: string;
  seaLevel: number; // 0.05
  seaLevelDividend: number; // 100.0
}

const tempColors = [
  [0.0, new THREE.Color(0x000000)],
  [0.123, new THREE.Color(0x2c5bdc)],
  [0.25, new THREE.Color(0x97f0ff)],
  [0.375, new THREE.Color(0x54f0c2)],
  [0.5, new THREE.Color(0x35d620)],
  [0.625, new THREE.Color(0x94f43e)],
  [0.75, new THREE.Color(0xf4d43e)],
  [0.875, new THREE.Color(0xf19622)],
  [1.0, new THREE.Color(0xff0000)],
];

const tempSpline = new LinearSpline(colorLerp);
// @ts-ignore
tempSpline.points = tempColors;

export class ColorGenerator implements Generator3<THREE.Color> {
  private splines = [
    new LinearSpline<THREE.Color>(colorLerp),
    new LinearSpline<THREE.Color>(colorLerp),
    new LinearSpline<THREE.Color>(colorLerp),
  ];
  constructor(private params: ColorGeneratorParams) {
    // Temp / Aridity
    this.splines[0].addPoint(0.0, new THREE.Color(this.params.tempHot));
    this.splines[0].addPoint(0.5, new THREE.Color(this.params.tempMid));
    this.splines[0].addPoint(1.0, new THREE.Color(this.params.tempCold));

    // Humid
    this.splines[1].addPoint(0.0, new THREE.Color(this.params.humidLow));
    this.splines[1].addPoint(0.5, new THREE.Color(this.params.humidMid));
    this.splines[1].addPoint(1.0, new THREE.Color(this.params.humidHigh));

    // sea
    this.splines[2].addPoint(0, new THREE.Color(this.params.seaDeep));
    this.splines[2].addPoint(0.03, new THREE.Color(this.params.seaMid));
    this.splines[2].addPoint(0.05, new THREE.Color(this.params.seaShallow));
  }

  get(x: number, y: number, z: number) {
    const m = this.params.biomeGenerator.get(x, y, z);
    const h = z / this.params.seaLevelDividend;

    if (h < this.params.seaLevel) {
      return this.splines[2].get(h);
    }

    const c1 = this.splines[0].get(h);
    const c2 = this.splines[1].get(h);

    return c1.lerp(c2, m);
  }

  getTemperature(vector: THREE.Vector3, height: number) {
    const t = 1.0 - Math.abs(vector.y);
    const perturb =
      this.params.biomeGenerator.get(vector.x, vector.y, vector.z) * 0.25;

    // height affects temp
    const heightFalloff = 1.0 - MathUtils.clamp(height / (0.2 * 300), 0, 1);
    const temp = MathUtils.clamp(t * heightFalloff + perturb, 0, 1);

    // moisture
    const moisture =
      this.params.biomeGenerator.get(vector.x, vector.y, vector.z) *
      heightFalloff;

    // return new THREE.Color(temp, moisture, 0);
    return tempSpline.get(MathUtils.clamp(temp, 0, 1));
  }
}
