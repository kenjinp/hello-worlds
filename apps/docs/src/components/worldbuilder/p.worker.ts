import {
  ChunkGenerator3Initializer,
  createThreadedPlanetWorker,
  Noise,
  NOISE_STYLES
} from "@hello-worlds/planets";
import { Color, Vector3 } from "three";

// We're not doing anything with this yet
export type ThreadParams = {
  randomPoints: {
    center: Vector3;
    radius: number;
    floorHeight: number;
  }[];
  rimWidth: number;
  rimSteepness: number;
  smoothness: number;
};

// Smooth minimum of two values, controlled by smoothing factor k
// When k = 0, this behaves identically to min(a, b)
function smoothMin(a: number, b: number, k: number) {
  k = Math.max(0, k);
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)));
  return a * h + b * (1 - h) - k * h * (1 - h);
}

// Smooth maximum of two values, controlled by smoothing factor k
// When k = 0, this behaves identically to max(a, b)
function smoothMax(a: number, b: number, k: number) {
  k = Math.min(0, -k);
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)));
  return a * h + b * (1 - h) - k * h * (1 - h);
}

const simpleHeight: ChunkGenerator3Initializer<ThreadParams, number> = ({
  initialData: { randomPoints },
}) => {
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
  return ({ input, data: { rimWidth, rimSteepness, smoothness } }) => {
    const offset = 0;
    let craterHeight = 0;
    // TODO optimize by hemisphere, or something
    for (let i = 0; i < randomPoints.length; i++) {
      const currentPoint = randomPoints[i];
      const floorHeight = currentPoint.floorHeight;
      const x = input.distanceTo(currentPoint.center) / currentPoint.radius;

      const cavity = x * x - 1;
      const rimX = Math.min(x - 1 - rimWidth, 0);
      const rim = rimSteepness * rimX * rimX;
      let craterShape = smoothMax(cavity, floorHeight, smoothness);
      craterShape = smoothMin(craterShape, rim, smoothness);
      craterHeight += craterShape * currentPoint.radius;
    }

    return (
      noise.get(input.x + offset, input.y + offset, input.z + offset) +
      craterHeight
    );
  };
};

const groundColor = new Color(0x8c7961);

const simpleColor: ChunkGenerator3Initializer<ThreadParams, Color> = () => {
  const chunkColor = new Color(Math.random() * 0xffffff);
  return () => {
    return chunkColor;
  };
};

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: simpleHeight,
  colorGenerator: simpleColor,
});
