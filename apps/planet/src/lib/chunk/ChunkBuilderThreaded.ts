import { NoiseParams } from "../noise/Noise";
import {
  ChunkMap,
  ChunkTypes,
  CubeFaceChildChunkProps,
  CubeFaceRootChunkProps,
} from "../planet/PlanetEngine";
import WorkerThreadPool from "../worker/WorkerThreadPool";
import ChunkThreaded from "./ChinkThreaded";
import chunkBuilderThreadedWorker from "./ChunkBuilderThreadedWorker?worker";

const DEFAULT_NUM_WORKERS = navigator?.hardwareConcurrency || 8;

export enum ChunkBuilderThreadedMessageTypes {
  BUILD_CHUNK_RESULT = "BUILD_CHUNK_RESULT",
  BUILD_CHUNK = "BUILD_CHUNK",
}

export interface ChunkBuilderThreadedMessage {
  subject: ChunkBuilderThreadedMessageTypes;
  data: any;
}

export interface AllocateChunkProps {
  noiseParams: NoiseParams;
  colorNoiseParams: NoiseParams;
  biomeParams: NoiseParams;
  colorGeneratorParams: {
    seaDeep: string;
    seaMid: string;
    seaShallow: string;
    tempHot: string;
    tempMid: string;
    tempCold: string;
    humidLow: string;
    humidMid: string;
    humidHigh: string;
    seaLevel: number;
    seaLevelDividend: number;
  };
  heightGeneratorParams: {
    min: number;
    max: number;
  };
  group: THREE.Object3D;
  offset: THREE.Vector3;
  origin: THREE.Vector3;
  transform: THREE.Matrix4;
  material: THREE.Material;
  width: number;
  radius: number;
  resolution: number;
  invert: boolean;
  isMinCellSize: boolean;
}

export default class ChunkBuilderThreaded {
  #old: (CubeFaceRootChunkProps | CubeFaceChildChunkProps)[] = [];
  // we keep the chunks stored with key of width
  #pool: Record<number, ChunkThreaded[]> = {};
  #workerPool: WorkerThreadPool<ChunkBuilderThreadedMessage>;

  constructor(numWorkers: number = DEFAULT_NUM_WORKERS) {
    this.#workerPool = new WorkerThreadPool(
      numWorkers,
      chunkBuilderThreadedWorker
    );
  }

  get old() {
    return this.#old;
  }

  get busyLength() {
    return this.#workerPool.busyLength;
  }

  get queueLength() {
    return this.#workerPool.queueLength;
  }

  #onResult(chunk: ChunkThreaded, msg: any) {
    if (msg.subject === ChunkBuilderThreadedMessageTypes.BUILD_CHUNK_RESULT) {
      chunk.rebuildMeshFromData(msg.data);
      chunk.show();
    }
  }

  allocateChunk(params: AllocateChunkProps) {
    const w = params.width;

    if (!(w in this.#pool)) {
      this.#pool[w] = [];
    }

    let c: ChunkThreaded | null = null;
    if (this.#pool[w].length > 0) {
      c = this.#pool[w].pop()!;
      c.params = params;
    } else {
      c = new ChunkThreaded(params);
    }

    c.hide();

    const threadedParams = {
      noiseParams: params.noiseParams,
      colorNoiseParams: params.colorNoiseParams,
      biomeParams: params.biomeParams,
      colorGeneratorParams: params.colorGeneratorParams,
      heightGeneratorParams: params.heightGeneratorParams,
      width: params.width,
      offset: [params.offset.x, params.offset.y, params.offset.z],
      radius: params.radius,
      origin: params.origin,
      resolution: params.resolution,
      worldMatrix: params.group.matrix,
      invert: params.invert,
    };

    const msg = {
      subject: ChunkBuilderThreadedMessageTypes.BUILD_CHUNK,
      params: threadedParams,
    };

    this.#workerPool.enqueue(msg, (m) => {
      if (c) {
        return void this.#onResult(c, m);
      }
      console.warn("no chunk found on enqueuement: ", m);
    });

    return c;
  }

  retireChunks(recycle: (CubeFaceRootChunkProps | CubeFaceChildChunkProps)[]) {
    this.#old.push(...recycle);
  }

  #recycleChunks(
    oldChunks: (CubeFaceRootChunkProps | CubeFaceChildChunkProps)[]
  ) {
    for (let chunk of oldChunks) {
      if (chunk.type === ChunkTypes.ROOT) {
        // we never get rid of roots!
        return;
      }
      const childChunk = chunk as unknown as CubeFaceChildChunkProps;
      if (!(childChunk.chunk.params.width in this.#pool)) {
        this.#pool[childChunk.chunk.params.width] = [];
      }
      childChunk.chunk.destroy();
    }
  }

  get busy() {
    return this.#workerPool.busy;
  }

  rebuild(chunkMap: ChunkMap) {
    console.log({ chunkMap });
    for (let key in chunkMap) {
      const chunk = chunkMap[key];
      if (chunk.type === ChunkTypes.CHILD) {
        const { material, ...params } = chunk.chunk.params;

        const threadedParams = {
          noiseParams: params.noiseParams,
          colorNoiseParams: params.colorNoiseParams,
          biomeParams: params.biomeParams,
          colorGeneratorParams: params.colorGeneratorParams,
          heightGeneratorParams: params.heightGeneratorParams,
          width: params.width,
          offset: [params.offset.x, params.offset.y, params.offset.z],
          radius: params.radius,
          origin: params.origin,
          resolution: params.resolution,
          worldMatrix: params.group.matrix,
          invert: params.invert,
        };

        const msg = {
          subject: ChunkBuilderThreadedMessageTypes.BUILD_CHUNK,
          params: threadedParams,
        };

        this.#workerPool.enqueue(msg, (m) => {
          if (chunk) {
            return void this.#onResult(chunk.chunk, m);
          }
        });
      } else {
        console.log({ rootChunk: chunk });
      }
    }
  }

  update() {
    if (!this.busy) {
      this.#recycleChunks(this.#old);
      this.#old = [];
    }
  }
}
