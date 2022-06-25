import * as THREE from "three";
import { dictDifference, dictIntersection } from "../../utils";
import ChunkThreaded from "../chunk/ChinkThreaded";
import ChunkBuilderThreaded from "../chunk/ChunkBuilderThreaded";
import { NoiseParams } from "../noise/Noise";
import CubicQuadTree from "../quadtree/CubicQuadTree";

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
  };
  width: number;
  offset: [number, number, number];
  radius: number;
  resolution: number;
  worldMatrix: THREE.Object3D["matrix"];
  invert: boolean;
}

export enum ChunkTypes {
  ROOT = "ROOT",
  CHILD = "CHILD",
}

// These root chunks host the interior children chunks
export interface CubeFaceRootChunkProps {
  index: number;
  type: ChunkTypes.ROOT;
  size: number;
  group: THREE.Object3D;
  position: THREE.Vector3;
  bounds: THREE.Box3;
}

export interface CubeFaceChildChunkProps {
  type: ChunkTypes.CHILD;
  position: THREE.Vector2;
  chunk: ChunkThreaded;
}

export type ChunkMap = Record<
  string,
  CubeFaceRootChunkProps | CubeFaceChildChunkProps
>;

const makeRootChunkKey = (child: CubeFaceRootChunkProps) => {
  return (
    child.position.x +
    "/" +
    child.position.y +
    " [" +
    child.size +
    "]" +
    " [" +
    child.index +
    "]"
  );
};

export interface PlanetEngineProps {
  numWorkers?: number;
}

export interface PlanetProps {
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
  minRadius: number;
  maxRadius: number;
  width: number;
  radius: number;
  invert: boolean;
  minCellSize: number;
  minCellResolution: number;
}

export default class PlanetEngine {
  rootGroup = new THREE.Group();
  cubeFaceGroups = [...new Array(6)].map((_) => new THREE.Group());
  #builder: ChunkBuilderThreaded;
  material: THREE.Material;
  #chunkMap: ChunkMap = {};
  planetProps: PlanetProps | null = null;

  constructor(private params: PlanetEngineProps) {
    this.#builder = new ChunkBuilderThreaded(this.params.numWorkers);
    // how to update materials...
    this.material = new THREE.MeshStandardMaterial({
      wireframe: false,
      wireframeLinewidth: 1,
      color: 0xffffff,
      side: THREE.DoubleSide,
      vertexColors: true,
    });
    this.rootGroup.add(...this.cubeFaceGroups);
  }

  // for debugging threads
  get busyInfo() {
    return {
      busy: this.#builder.busy,
      busyLength: this.#builder.busyLength,
      queueLength: this.#builder.queueLength,
    };
  }

  // to re-apply parameter changes, for example
  rebuild() {
    this.#builder.rebuild(this.#chunkMap);
  }

  update(anchorPoint: THREE.Vector3) {
    if (!this.planetProps) {
      throw new Error("must set planetProps before updating");
    }

    this.#builder.update();
    if (this.#builder.busy) {
      return;
    }

    // update visible chunks quadtree
    const q = new CubicQuadTree({
      radius: this.planetProps.radius,
      minNodeSize: this.planetProps.minCellSize,
    });

    // collapse the quadtree recursively at this position
    q.insert(anchorPoint);

    const sides = q.getChildren();

    let newChunkMap: ChunkMap = {};
    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();
    for (let i = 0; i < sides.length; i++) {
      const cubeFaceRootGroup = this.cubeFaceGroups[i];
      cubeFaceRootGroup.matrix = sides[i].transform;
      cubeFaceRootGroup.matrixAutoUpdate = false;
      for (let cubeFaceChildChunk of sides[i].children) {
        cubeFaceChildChunk.bounds.getCenter(center);
        cubeFaceChildChunk.bounds.getSize(dimensions);

        const cubeFaceRootChunk: CubeFaceRootChunkProps = {
          type: ChunkTypes.ROOT,
          index: i,
          group: cubeFaceRootGroup,
          position: center.clone(),
          bounds: cubeFaceChildChunk.bounds.clone(),
          size: dimensions.x,
        };

        const key = makeRootChunkKey(cubeFaceRootChunk);
        newChunkMap[key] = cubeFaceRootChunk;
      }
    }

    const intersection = dictIntersection(this.#chunkMap, newChunkMap);
    const difference = dictDifference(newChunkMap, this.#chunkMap);
    const recycle = Object.values(dictDifference(this.#chunkMap, newChunkMap));

    this.#builder.retireChunks(recycle);

    newChunkMap = intersection;

    // Now let's build the children chunks who actually show terrain detail
    for (let key in difference) {
      if (difference[key].type !== ChunkTypes.ROOT) {
        console.warn("something strange", key, difference[key]);
      }
      const parentChunkProps = difference[key] as CubeFaceRootChunkProps;
      const offset = parentChunkProps.position.clone();
      newChunkMap[key] = {
        type: ChunkTypes.CHILD,
        position: new THREE.Vector2(offset.x, offset.z),
        chunk: this.#builder.allocateChunk({
          group: parentChunkProps.group,
          material: this.material,
          offset,
          noiseParams: this.planetProps.noiseParams,
          colorNoiseParams: this.planetProps.colorNoiseParams,
          biomeParams: this.planetProps.biomeParams,
          colorGeneratorParams: this.planetProps.colorGeneratorParams,
          heightGeneratorParams: {
            min: this.planetProps.minRadius,
            max: this.planetProps.maxRadius,
          },
          width: parentChunkProps.size,
          radius: this.planetProps.radius,
          resolution: this.planetProps.minCellResolution,
          invert: this.planetProps.invert,
        }),
      };
    }

    this.#chunkMap = newChunkMap;
  }
}
