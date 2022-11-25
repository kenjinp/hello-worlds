import { Chunk } from "./Chunk"

export class ChunkWillBeDisposedEvent {
  type = "ChunkWillBeDisposed"
  static type = "ChunkWillBeDisposed"
  constructor(public chunk: Chunk) {}
}

export class ChunkGeneratedEvent {
  type = "ChunkGenerated"
  static type = "ChunkGenerated"
  constructor(public chunk: Chunk) {}
}
