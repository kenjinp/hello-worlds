import Rand from "rand-seed";
export * from "./utils";

declare global {
  var _hello_world_core_instances: number;
}
let _seed: string | undefined = undefined;
let _rand = new Rand(_seed);

export const setRandomSeed = (seed: string) => {
  _seed = seed;
  _rand = new Rand(seed);
};

export const random = (): number => {
  return _rand.next();
};

function main(): void {
  let registry = globalThis._hello_world_core_instances;
  if (registry) {
    throw new Error("You should only have one version of @hello-worlds/core");
  }
  registry = 1;
}

main();
