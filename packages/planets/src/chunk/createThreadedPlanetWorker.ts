import { Color } from "three";
import { buildChunk } from "./BuildChunk";
import { ChunkBuilderThreadedMessageTypes, ChunkGenerator3 } from "./types";

export const createThreadedPlanetWorker = <T>({
  heightGenerator,
  colorGenerator,
}: {
  colorGenerator: ChunkGenerator3<Color, T>;
  heightGenerator: ChunkGenerator3<number, T>;
}) => {
  const builder = buildChunk();
  self.onmessage = (msg) => {
    if (msg.data.subject == ChunkBuilderThreadedMessageTypes.BUILD_CHUNK) {
      const data = builder({
        ...msg.data.params,
        heightGenerator,
        colorGenerator,
      });
      self.postMessage({
        subject: ChunkBuilderThreadedMessageTypes.BUILD_CHUNK_RESULT,
        data,
      });
    }
  };
};
