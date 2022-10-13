import {
  ChunkGenerator3Initializer,
  DEFAULT_NOISE_PARAMS,
  Lerp,
  LinearSpline,
  Noise
} from "@hello-worlds/planets"
import { Color } from "three"
import { remap } from "../WorldBuilder.math"
import { InitialData } from "../WorldBuilder.worker"

export const heightGenerator: ChunkGenerator3Initializer<
  {},
  number,
  InitialData
> = ({ initialData: { seed, type }, radius }) => {
  const mountains = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blip",
    height: 20_000,
    scale: radius / 75,
  })

  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "blarp",
    height: 10_000,
    scale: radius / 3,
  })

  const warp = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 8,
    seed: "apple", // <-important
    height: 10000.0,
    scale: radius / 2,
  })

  const oceanNoiseMask = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "ocean",
    height: 1,
    scale: radius,
  })

  return ({ input }) => {
    const w = warp.get(input.x, input.y, input.z)
    const m = mountains.get(input.x + w, input.y + w, input.z + w)
    const n = noise.get(input.x + w, input.y + w, input.z + w)
    const o = oceanNoiseMask.get(input.x + w, input.y + w, input.z + w)
    // if (o > 0.075) {
    //   return n + m
    // }
    return n + m
  }
}

const oceanColor = new Color(0x1d5a67)
const groundColor = new Color(0x214711)

const colorLerp: Lerp<THREE.Color> = (
  t: number,
  p0: THREE.Color,
  p1: THREE.Color
) => {
  const c = p0.clone();
  return c.lerp(p1, t);
};

const colorSplines = [
  new LinearSpline<THREE.Color>(colorLerp),
  new LinearSpline<THREE.Color>(colorLerp),
  new LinearSpline<THREE.Color>(colorLerp),
];

// Temp / Aridity
colorSplines[0].addPoint(0.0, new Color(0x37a726));
colorSplines[0].addPoint(0.05, new Color(0x214711));
colorSplines[0].addPoint(0.4, new Color(0x526b48));
colorSplines[0].addPoint(0.9, new Color(0xab7916));
colorSplines[0].addPoint(1.0, new Color(0xbab3a2));
export const colorGenerator: ChunkGenerator3Initializer<
  {},
  Color,
  InitialData
> = () => {
  return ({ input }) => {
    const height = input.z
    return height > 0.2 ?  colorSplines[0].get(remap(height, 0, 5_000, 0, 1)) : oceanColor
  }
}
