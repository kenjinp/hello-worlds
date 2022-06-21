import { useControls } from "leva";
import * as React from "react";
import Noise, { NoiseParams, NOISE_STYLES } from "./Noise";

export const DEFAULT_NOISE_PARAMS = {
  octaves: 13,
  persistence: 0.707,
  lacunarity: 1.8,
  exponentiation: 4.5,
  height: 300.0,
  scale: 1100.0,
  seed: 1,
  noiseType: NOISE_STYLES.simplex,
};

export const useNoiseController = (
  name: string = "noise",
  noiseParams: NoiseParams = DEFAULT_NOISE_PARAMS
) => {
  const controllerValues = useControls(name, {
    ...noiseParams,
    noiseType: {
      value: NOISE_STYLES.simplex,
      options: [NOISE_STYLES.perlin, NOISE_STYLES.simplex],
    },
  });

  const noise = React.useMemo(
    () =>
      new Noise({
        ...controllerValues,
        // @ts-ignore
        noiseType: controllerValues.noiseType,
      }),
    [controllerValues]
  );

  return noise;
};
