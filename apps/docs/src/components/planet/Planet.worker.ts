import {
  ChunkGenerator3Initializer,
  createThreadedPlanetWorker,
  DEFAULT_NOISE_PARAMS,
  Noise,
} from "@hello-worlds/planets";
import { Color } from "three";

// We're not doing anything with this yet
export type ThreadParams = {
  // totally empty
};

const simpleHeight: ChunkGenerator3Initializer<ThreadParams, number> = ({
  radius,
}) => {
  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "banana",
  });
  const noise2 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 20,
    scale: radius / 4,
    height: radius / 100,
    seed: "apple",
  });
  return ({ input }) => {
    return (
      noise.get(input.x, input.y, input.z) +
      noise2.get(input.x, input.y, input.z)
    );
  };
};

const simpleColor: ChunkGenerator3Initializer<ThreadParams, Color> = () =>
  // this could be just sent to frag shader lol
  ({ worldPosition }) => {
    const w = worldPosition.clone().normalize();
    return new Color().setRGB(w.x, w.y, w.z);
  };

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: simpleHeight,
  colorGenerator: simpleColor,
});
