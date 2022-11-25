import { random } from "@hello-worlds/core"
import SimplexNoise from "simplex-noise"
import { DEFAULT_NOISE_PARAMS } from "../defaults"
import { NOISE_TYPES } from "./Noise.types"

export interface NoiseParams {
  seed?: string | number
  scale: number
  height: number
  noiseType: NOISE_TYPES
  octaves: number
  persistence: number
  lacunarity: number
  exponentiation: number
}

export class Noise {
  params: NoiseParams
  private noiseFunctions: {
    [key: string]: {
      noise3D: (x: number, y: number, z: number) => number
    }
  }
  constructor(params: Partial<NoiseParams>) {
    this.params = {
      ...DEFAULT_NOISE_PARAMS,
      ...params,
    }
    const seed = this.params.seed || random
    const simplex = new SimplexNoise(seed)

    this.noiseFunctions = {
      [NOISE_TYPES.FBM]: simplex,
      [NOISE_TYPES.BILLOWING]: {
        noise3D: (x: number, y: number, z: number) =>
          Math.abs(simplex.noise3D(x, y, z)),
      },
      [NOISE_TYPES.RIGID]: {
        noise3D: (x: number, y: number, z: number) =>
          1.0 - Math.abs(simplex.noise3D(x, y, z)),
      },
      // iq: simplex, // not implemented
    }
  }

  get(x: number, y: number, z: number) {
    const G = 2.0 ** -this.params.persistence
    const xs = x / this.params.scale
    const ys = y / this.params.scale
    const zs = z / this.params.scale
    const noiseFunc = this.noiseFunctions[this.params.noiseType]

    let amplitude = 1.0
    let frequency = 1.0
    let normalization = 0
    let total = 0
    for (let o = 0; o < this.params.octaves; o++) {
      const noiseValue =
        noiseFunc.noise3D(xs * frequency, ys * frequency, zs * frequency) *
          0.5 +
        0.5
      total += noiseValue * amplitude
      normalization += amplitude
      amplitude *= G
      frequency *= this.params.lacunarity
    }
    total /= normalization
    return Math.pow(total, this.params.exponentiation) * this.params.height
  }
}
