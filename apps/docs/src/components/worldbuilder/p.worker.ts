import {
  ChunkGenerator3,
  createThreadedPlanetWorker,
  Noise,
  NOISE_STYLES,
} from "@hello-worlds/planets";
import { Color } from "three";

// We're not doing anything with this yet
export type ThreadParams = {
  // totally empty
};

const simpleHeight: ChunkGenerator3<ThreadParams, number> = {
  // maybe we can use this as a base for an ocean
  get({ input, width }) {
    const noise = new Noise({
      octaves: 50,
      persistence: 0.707,
      lacunarity: 1.8,
      exponentiation: 4.5,
      height: 300.0,
      scale: 1100.0,
      seed: "🌱", // should set this at build time... or sync through net
      noiseType: NOISE_STYLES.simplex,
    });
    const warpNoise = new Noise({
      octaves: 1,
      persistence: 0.707,
      lacunarity: 1.8,
      exponentiation: 4.5,
      height: 500.0,
      scale: 4000.0,
      seed: "🌱", // should set this at build time... or sync through net
      noiseType: NOISE_STYLES.simplex,
    });

    const offset = warpNoise.get(input.x, input.y, input.z);
    return noise.get(input.x + offset, input.y + offset, input.z + offset);
  },
};

const simpleColor: ChunkGenerator3<ThreadParams, Color> = {
  // this could be just sent to frag shader lol
  get({ worldPosition }) {
    const w = worldPosition.clone().normalize();
    return new Color().setRGB(w.x, w.y, w.z);
  },
};

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: simpleHeight,
  colorGenerator: simpleColor,
});
