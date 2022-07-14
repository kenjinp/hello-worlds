import Rand from "rand-seed";
export * from "./utils";

let _rand = new Rand();

export const setRandomSeed = (seed: string) => {
  _rand = new Rand(seed);
};

export const random = _rand.next;
