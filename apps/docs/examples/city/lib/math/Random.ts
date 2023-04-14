import Rand from "rand-seed"

export class Random {
  #random: Rand = new Rand()
  #seed: string | undefined = undefined
  constructor(seed?: string) {
    return this.setSeed(seed)
  }

  public setSeed(seed?: string) {
    this.#seed = seed
    this.#random = new Rand(seed)
    return this
  }

  get seed() {
    return this.#seed
  }

  next() {
    return this.#random.next()
  }

  float() {
    return this.next()
  }

  range(max: number, min: number = 0) {
    return this.float() * (max - min) + min
  }

  int(max: number, min: number = 0) {
    return Math.floor(this.float() * (max - min + 1)) + min
  }

  bool(chance = 0.5) {
    return this.float() < chance
  }

  normal() {
    return (this.float() + this.float() + this.float()) / 3
  }

  fuzzy(f = 1.0) {
    return f == 0 ? 0.5 : (1 - f) / 2 + f * this.normal()
  }
}
