import { Color } from "three"
import {
  ChunkBuilderThreadedMessageTypes,
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
} from "../chunk/types"
import { buildFlatWorldChunk } from "./FlatWorld.chunk"

export function createThreadedFlatWorldWorker<D>({
  heightGenerator,
  colorGenerator,
}: {
  heightGenerator: ChunkGenerator3Initializer<D>
  colorGenerator?: ChunkGenerator3Initializer<D, Color | ColorArrayWithAlpha>
}) {
  let builder: ReturnType<typeof buildFlatWorldChunk<D>>
  let id: string | null
  self.onmessage = msg => {
    if (msg.data.subject == ChunkBuilderThreadedMessageTypes.INITIAL_DATA) {
      builder = buildFlatWorldChunk<D>({
        heightGenerator: heightGenerator(msg.data.buildChunkInitialProps),
        colorGenerator:
          colorGenerator && colorGenerator(msg.data.buildChunkInitialProps),
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
