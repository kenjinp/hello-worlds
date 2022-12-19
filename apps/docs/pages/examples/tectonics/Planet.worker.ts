import { createThreadedPlanetWorker } from "@hello-worlds/planets"
import {
  plateColor,
  tectonicHeightGenerator,
  ThreadParams,
} from "./Planet.generators"

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: tectonicHeightGenerator,
  colorGenerator: plateColor,
})
