import { random } from "@hello-worlds/core"
import SimplexNoise from "simplex-noise"
import { Vector3 } from "three"
import { DEFAULT_NOISE_PARAMS } from "../defaults"
import { tempVector3 } from "../utils"
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

  getFromVector(v: THREE.Vector3) {
    return this.get(v.x, v.y, v.z)
  }

  calculateDerivative(position: Vector3, stepSize: number) {
    return calculateNoiseDerivative(this, position, stepSize)
  }
}

export function calculateNoiseDerivative(
  noise: Noise,
  position: Vector3,
  stepSize: number,
) {
  // Calculate the noise value at the current position
  const currentNoise = noise.getFromVector(position)

  // Calculate the noise value at the position with a small step in the x direction
  const noiseX = noise.getFromVector(
    tempVector3.set(position.x + stepSize, position.y, position.z),
  )

  // Calculate the noise value at the position with a small step in the y direction
  const noiseY = noise.getFromVector(
    tempVector3.set(position.x, position.y + stepSize, position.z),
  )

  // Calculate the noise value at the position with a small step in the z direction
  const noiseZ = noise.getFromVector(
    tempVector3.set(position.x, position.y, position.z + stepSize),
  )

  // Calculate the derivative of the noise function in the x direction
  const derivativeX = (noiseX - currentNoise) / stepSize

  // Calculate the derivative of the noise function in the y direction
  const derivativeY = (noiseY - currentNoise) / stepSize

  // Calculate the derivative of the noise function in the z direction
  const derivativeZ = (noiseZ - currentNoise) / stepSize

  // Return the derivative vector
  return tempVector3.set(derivativeX, derivativeY, derivativeZ).clone()
}
