import { useControls } from "leva";
import * as React from "react";
import Noise, { NOISE_STYLES } from "./Noise";

export const DEFAULT_NOISE_PARAMS = {
  octaves: 13,
  persistence: 0.707,
  lacunarity: 1.8,
  exponentiation: 4.5,
  height: 300.0,
  scale: 1100.0,
  seed: 1,
};

export const useNoiseController = () => {
  const noiseParams = useControls("noise", {
    ...DEFAULT_NOISE_PARAMS,
    noiseType: {
      value: NOISE_STYLES.simplex,
      options: [NOISE_STYLES.perlin, NOISE_STYLES.simplex],
    },
  });

  const noise = React.useMemo(
    () =>
      new Noise({
        ...noiseParams,
        // @ts-ignore
        noiseType: noiseParams.noiseType,
      }),
    [noiseParams]
  );

  return noise;
};
