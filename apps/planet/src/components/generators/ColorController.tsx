import { useControls } from "leva";
import * as React from "react";
import * as THREE from "three";
import { NOISE_STYLES } from "../noise/Noise";
import { useNoiseController } from "../noise/NoiseController";
import { ColorGenerator, ColorGeneratorParams } from "./ColorGenerator";

export const DEFAULT_COLOR_PARAMS = {
  seaDeep: new THREE.Color(0x20020ff).getStyle(),
  seaMid: new THREE.Color(0x40e2ff).getStyle(),
  seaShallow: new THREE.Color(0x40e2ff).getStyle(),
  tempHot: new THREE.Color(0xb7a67d).getStyle(),
  tempMid: new THREE.Color(0xf1e1bc).getStyle(),
  tempCold: new THREE.Color(0xffffff).getStyle(),
  humidLow: new THREE.Color(0x29c100).getStyle(),
  humidMid: new THREE.Color(0xcee59c).getStyle(),
  humidHigh: new THREE.Color(0xffffff).getStyle(),
  seaLevel: 0.05,
  seaLevelDividend: 100,
};

export const useColorController = (seed: number | string = 1) => {
  const controllerValues = useControls(
    "biome colors",
    // @ts-ignore
    {
      ...DEFAULT_COLOR_PARAMS,
      seaLevelDividend: {
        min: 1,
        value: 100,
        step: 1,
      },
      seaLevel: {
        min: 0,
        value: 0.05,
        step: 0.01,
      },
    }
  );

  const { noise, noiseParams } = useNoiseController("biome noise", {
    octaves: 10,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 3.9,
    height: 64,
    scale: 256.0,
    noiseType: NOISE_STYLES.simplex,
    seed,
  });

  const colorGenerator = React.useMemo(
    () =>
      new ColorGenerator({
        ...(controllerValues as unknown as ColorGeneratorParams),
        biomeGenerator: noise,
      }),
    [controllerValues, noise]
  );

  return {
    colorGenerator,
    colorParams: controllerValues,
    colorNoiseParams: noiseParams,
  };
};
