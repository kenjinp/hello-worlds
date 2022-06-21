import * as React from "react";
import { NOISE_STYLES } from "../noise/Noise";
import { useNoiseController } from "../noise/NoiseController";
import { useTerrainController } from "../terrain/TerrainController";

const Planet: React.FC = () => {
  const noise = useNoiseController("noise");
  const biomes = useNoiseController("biomes", {
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 3.9,
    scale: 2048.0,
    noiseType: NOISE_STYLES.simplex,
    seed: 2,
    height: 1,
  });
  const terrain = useTerrainController();
  return null;
};

export default Planet;
