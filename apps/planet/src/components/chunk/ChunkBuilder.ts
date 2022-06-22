import * as THREE from "three";
import { Node } from "../quadtree/Quadtree";
import Chunk, { ChunkProps } from "./Chunk";

export interface ChunkChild {
  // index: number;
  // group: THREE.Object3D;
  position: THREE.Vector2;
  chunk: Chunk;
  // bounds: Node["bounds"];
  // size: number;
}

export interface RootChunk {
  index: number;
  group: THREE.Object3D;
  position: THREE.Vector3;
  bounds: Node["bounds"];
  size: number;
}

export interface AllocateChunkBuilderParams {
  group: THREE.Object3D;
  offset: THREE.Vector3;
  width: number;
  resolution: number;
}

export type ChunkMap = Record<string, ChunkChild | RootChunk>;

export default class ChunkBuilder {
  #old: Chunk[] = [];
  #new: Chunk[] = [];
  #active: Generator<undefined, void, unknown> | null = null;
  #queued: Chunk[] = [];
  #pool: Record<number, Chunk[]> = {};

  allocateChunk(params: ChunkProps) {
    const w = params.width;

    if (!(w in this.#pool)) {
      this.#pool[w] = [];
    }

    let c = null;
    if (this.#pool[w].length > 0) {
      c = this.#pool[w].pop();
      c!.params = params;
    } else {
      c = new Chunk(params);
    }

    c!.hide();

    this.#queued.push(c!);

    return c!;
  }

  recycleChunks(chunks: ChunkChild[]) {
    for (let c of chunks) {
      if (!(c.chunk.params.width in this.#pool)) {
        this.#pool[c.chunk.params.width] = [];
      }

      if (c.chunk) {
        c.chunk.destroy();
      } else {
        // @ts-ignore
        c.destroy();
      }
    }
  }

  insertOld(oldChunksToThrowAway: ChunkChild[]) {
    // @ts-ignore
    this.#old.push(...oldChunksToThrowAway);
  }

  get busy() {
    return this.#active || this.#queued.length > 0;
  }

  #reset() {
    this.#old = [];
    this.#new = [];
    this.#queued = [];
    this.#active = null;
  }

  rebuild(chunks: ChunkMap) {
    if (this.busy) {
      return;
    }
    for (let k in chunks) {
      if ((chunks[k] as ChunkChild).chunk) {
        this.#queued.push((chunks[k] as ChunkChild).chunk);
      }
    }
  }

  update() {
    if (this.#active) {
      const activeChunk = this.#active.next();
      if (activeChunk.done) {
        this.#active = null;
      }
    } else {
      const nextChunk = this.#queued.pop();
      if (nextChunk) {
        this.#active = nextChunk.rebuild();
        this.#new.push(nextChunk);
      }
    }

    if (this.#active) {
      return;
    }

    if (!this.#queued.length) {
      this.recycleChunks(this.#old);
      for (let newChunk of this.#new) {
        newChunk.show();
      }
      this.#reset();
    }
  }
}
