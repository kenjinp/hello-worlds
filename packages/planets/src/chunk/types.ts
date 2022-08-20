import THREE, { Color, Object3D, Vector3 } from "three";

export enum ChunkBuilderThreadedMessageTypes {
  BUILD_CHUNK_RESULT = "BUILD_CHUNK_RESULT",
  BUILD_CHUNK = "BUILD_CHUNK",
}

export interface ChunkBuilderThreadedMessage {
  subject: ChunkBuilderThreadedMessageTypes;
  data: any;
}

export interface ThreadedChunkProps_Old {
  noiseParams: any;
  colorNoiseParams: any;
  biomeParams: any;
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
    seaLevel: number; // 0.05
    seaLevelDividend: number; // 100.0
  };
  heightGeneratorParams: {
    min: number;
    max: number;
    // tileMap: TileMAp;
  };
  origin: THREE.Vector3;
  width: number;
  offset: [number, number, number];
  radius: number;
  resolution: number;
  worldMatrix: THREE.Object3D["matrix"];
  invert: boolean;
}

export interface ChunkGenerator3<D, T = number> {
  get(params: {
    input: Vector3;
    data: D;
    worldPosition: Vector3;
    width: number;
    offset: Vector3;
    radius: number;
    resolution: number;
    worldMatrix: Object3D["matrix"];
  }): T;
}

// TODO -> should we do something like this?
// export type ChunkGenerator3<D, T = number> = () => (params: {
//   input: Vector3;
//   data: D;
//   worldPosition: Vector3;
//   width: number;
//   offset: Vector3;
//   radius: number;
//   resolution: number;
//   worldMatrix: Object3D["matrix"];
// }) => T;

export interface BuildChunkParams<T> {
  width: number;
  offset: Vector3;
  radius: number;
  resolution: number;
  worldMatrix: Object3D["matrix"];
  invert: boolean;
  // ColorGenerator receives height data from previous step
  colorGenerator: ChunkGenerator3<T & { height: number }, Color>;
  heightGenerator: ChunkGenerator3<T, number>;
  data: T;
}
