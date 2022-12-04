import { createThreadedPlanetWorker } from "@hello-worlds/planets"
import {
  colorGenerator,
  tectonicHeightGenerator,
  ThreadParams,
} from "./Planet.generators"

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: tectonicHeightGenerator,
  colorGenerator: colorGenerator,
})
