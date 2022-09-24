import { Color } from "three"
import { buildChunk } from "./BuildChunk"
import {
  ChunkBuilderThreadedMessageTypes,
  ChunkGenerator3Initializer,
} from "./types"

export function createThreadedPlanetWorker<T, I>({
  heightGenerator,
  colorGenerator,
}: {
  heightGenerator: ChunkGenerator3Initializer<T, number, I>
  colorGenerator: ChunkGenerator3Initializer<T, Color, I>
}) {
  let builder: ReturnType<typeof buildChunk<T, I>>
  let id: string | null
  self.onmessage = msg => {
    if (msg.data.subject == ChunkBuilderThreadedMessageTypes.INITIAL_DATA) {
      builder = buildChunk<T, I>({
        heightGenerator: heightGenerator(msg.data.initialData),
        colorGenerator: colorGenerator(msg.data.initialData),
      })
      id = msg.data.id
      return
    }
    if (!msg.data.id || msg.data.id !== id) {
      return
    }
    if (msg.data.subject == ChunkBuilderThreadedMessageTypes.BUILD_CHUNK) {
      if (!builder) {
        throw new Error(
          "Builder received BUILD_CHUNK message before initialization",
        )
      }
      const data = builder({
        ...msg.data.params,
      })
      self.postMessage({
        subject: ChunkBuilderThreadedMessageTypes.BUILD_CHUNK_RESULT,
        data,
      })
    }
  }
}
