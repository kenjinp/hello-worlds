import SimplexNoise from "simplex-noise";

export default class Noise {
  private noise: SimplexNoise;
  constructor(
    private seed: number,
    private scale: number,
    private octaves: number,
    private lacunarity: number,
    private exponentiation: number,
    private height: number,
    private persistence: number
  ) {
    this.noise = new SimplexNoise(this.seed);
  }

  get(x: number, y: number, z: number) {
    const G = 2.0 ** -this.persistence;
    const xs = x / this.scale;
    const ys = y / this.scale;
    const zs = z / this.scale;
    const noiseFunc = this.noise;

    let amplitude = 1.0;
    let frequency = 1.0;
    let normalization = 0;
    let total = 0;
    for (let o = 0; o < this.octaves; o++) {
      const noiseValue =
        noiseFunc.noise3D(xs * frequency, ys * frequency, zs * frequency) *
          0.5 +
        0.5;
      total += noiseValue * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= this.lacunarity;
    }
    total /= normalization;
    return Math.pow(total, this.exponentiation) * this.height;
  }
}
