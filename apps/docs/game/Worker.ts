import { createThreadedPlanetWorker } from "@hello-worlds/planets"
import { colorGenerator, heightGenerator, ThreadParams } from "./generators/all"

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
