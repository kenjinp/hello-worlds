import {
  ChunkGenerator3Initializer, DEFAULT_NOISE_PARAMS, Noise
} from "@hello-worlds/planets";
import { Color } from "three";
import { InitialData } from "../WorldBuilder.worker";

export const heightGenerator: ChunkGenerator3Initializer<{}, number, InitialData> = ({
  initialData: { seed, type },
  radius
}) => {
  const mountains = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blip",
    height: 10_000,
    scale: radius / 75
  });

  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blarp",
    height: 10_000,
    scale: radius / 3
  });

  const warp = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 8,
    seed: "apple", // <-important
    height: 10000.0,
    scale: radius / 2,
  });

  const oceanNoiseMask = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "ocean",
    height: 1,
    scale: radius
  });

  return ({ input }) => {
    const w = warp.get(input.x, input.y, input.z);
    const m = mountains.get(input.x, input.y, input.z);
    const n = noise.get(input.x + w, input.y + w, input.z + w);
    const o = oceanNoiseMask.get(input.x + w, input.y + w, input.z + w);
    if (o > 0.075) {
      return n + m;
    }
    return -n;
  }
}

const oceanColor = new Color(0x1d5a67);
const groundColor = new Color(0x214711)
export const colorGenerator: ChunkGenerator3Initializer<{}, Color, InitialData> = () => {
  return ({ input }) => {
    const height = input.z;
    return height > 0.2 ? groundColor : oceanColor;
  };
};
