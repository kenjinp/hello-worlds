import { createThreadedPlanetWorker } from "@hello-worlds/planets"
import {
  ThreadParams,
  colorGenerator,
  heightGenerator,
} from "./Moonworker.generators"

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
