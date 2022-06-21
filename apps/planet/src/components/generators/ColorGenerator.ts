import * as THREE from "three";
import Noise from "../noise/Noise";
import LinearSpline, { Lerp } from "../spline/LinearSpline";
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
  seaDeep: THREE.Color;
  seaMid: THREE.Color;
  seaShallow: THREE.Color;
  tempHot: THREE.Color;
  tempMid: THREE.Color;
  tempCold: THREE.Color;
  humidLow: THREE.Color;
  humidMid: THREE.Color;
  humidHigh: THREE.Color;
  seaLevel: number; // 0.05
  seaLevelDividend: number; // 100.0
}

export class ColorGenerator implements Generator3<THREE.Color> {
  private splines = [
    new LinearSpline<THREE.Color>(colorLerp),
    new LinearSpline<THREE.Color>(colorLerp),
    new LinearSpline<THREE.Color>(colorLerp),
  ];
  constructor(private params: ColorGeneratorParams) {
    // Temp / Aridity
    this.splines[0].addPoint(0.0, this.params.tempHot);
    this.splines[0].addPoint(0.5, this.params.tempMid);
    this.splines[0].addPoint(1.0, this.params.tempCold);

    // Humid
    this.splines[1].addPoint(0.0, this.params.humidLow);
    this.splines[1].addPoint(0.5, this.params.humidMid);
    this.splines[1].addPoint(1.0, this.params.humidHigh);

    // sea
    this.splines[2].addPoint(0, this.params.seaDeep);
    this.splines[2].addPoint(0.03, this.params.seaMid);
    this.splines[2].addPoint(0.05, this.params.seaShallow);
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
}
