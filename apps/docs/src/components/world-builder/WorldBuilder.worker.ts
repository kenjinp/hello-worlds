import {
  ChunkGenerator3Initializer,
  createThreadedPlanetWorker,
  DEFAULT_NOISE_PARAMS, Noise
} from "@hello-worlds/planets";
import { Color } from "three";

// We're not doing anything with this yet
export type ThreadParams = {
  seed: string;
};

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  initialData: { seed },
  radius
}) => {

  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed,
    height: 5_000,
    scale: radius,
  });

  return ({ input }) => {
    const n = noise.get(input.x, input.y, input.z);

    return n;
  }
}

const colorGenerator: ChunkGenerator3Initializer<ThreadParams, Color> = () => {
  const chunkColor = new Color(Math.random() * 0xffffff);
  return ({ input }) => {
    return chunkColor;
  };
};


createThreadedPlanetWorker<ThreadParams, {}>({
  heightGenerator,
  colorGenerator,
});