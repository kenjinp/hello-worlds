import {
  ChunkGenerator3,
  createThreadedPlanetWorker,
  DEFAULT_NOISE_PARAMS,
  Noise,
} from "@hello-worlds/planets";
import { Color } from "three";

// We're not doing anything with this yet
export type ThreadParams = {
  // totally empty
};

let noise: Noise;
let noise2: Noise;
const simpleHeight: ChunkGenerator3<ThreadParams, number> = {
  // maybe we can use this as a base for an ocean
  get({ input, radius }) {
    if (!noise) {
      noise = new Noise({
        ...DEFAULT_NOISE_PARAMS,
        seed: "banana",
      });
    }
    if (!noise2) {
      noise2 = new Noise({
        ...DEFAULT_NOISE_PARAMS,
        octaves: 20,
        scale: radius / 4,
        height: radius / 100,
        seed: "apple",
      });
    }
    return (
      noise.get(input.x, input.y, input.z) +
      noise2.get(input.x, input.y, input.z)
    );
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
