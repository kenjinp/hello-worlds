import {
  ChunkGenerator3,
  createThreadedPlanetWorker,
} from "@hello-worlds/planets"
import { Color } from "three"

// We're not doing anything with this yet
export type ThreadParams = {
  // totally empty
}

const simpleHeight: ChunkGenerator3<ThreadParams, number> = {
  // maybe we can use this as a base for an ocean
  get({ input, worldPosition, data }) {
    return 1
  },
}

const simpleColor: ChunkGenerator3<ThreadParams, Color> = {
  // this could be just sent to frag shader lol
  get({ input, worldPosition, data }) {
    const w = worldPosition.clone().normalize()
    return new Color().setRGB(w.x, w.y, w.z)
  },
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: simpleHeight,
  colorGenerator: simpleColor,
})
