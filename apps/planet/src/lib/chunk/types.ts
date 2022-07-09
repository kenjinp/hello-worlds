import THREE from "three";

export enum ChunkBuilderThreadedMessageTypes {
  BUILD_CHUNK_RESULT = "BUILD_CHUNK_RESULT",
  BUILD_CHUNK = "BUILD_CHUNK",
}

export interface ChunkBuilderThreadedMessage {
  subject: ChunkBuilderThreadedMessageTypes;
  data: any;
}

export interface ThreadedChunkProps {
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
