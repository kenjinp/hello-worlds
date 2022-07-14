import { random } from "@hello-worlds/core";
import * as THREE from "three";
import ChunkThreaded from "../chunk/ChinkThreaded";
import ChunkBuilderThreaded from "../chunk/ChunkBuilderThreaded";
import { NoiseParams, NOISE_STYLES } from "../noise/Noise";
import CubicQuadTree from "../quadtree/CubicQuadTree";
import { dictDifference, dictIntersection } from "../utils";

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
  transform: THREE.Matrix4;
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

const seed = (random() + 1).toString(36).substring(7);

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

export const DEFAULT_COLOR_PARAMS = {
  seaDeep: new THREE.Color(0x20020ff).getStyle(),
  seaMid: new THREE.Color(0x40e2ff).getStyle(),
  seaShallow: new THREE.Color(0x40e2ff).getStyle(),
  tempHot: new THREE.Color(0xb7a67d).getStyle(),
  tempMid: new THREE.Color(0xf1e1bc).getStyle(),
  tempCold: new THREE.Color(0xffffff).getStyle(),
  humidLow: new THREE.Color(0x29c100).getStyle(),
  humidMid: new THREE.Color(0xcee59c).getStyle(),
  humidHigh: new THREE.Color(0xffffff).getStyle(),
  seaLevel: 0.05,
  seaLevelDividend: 100,
};

export const DEFAULT_HEIGHT_PARAMS = {
  minRadius: 100_000,
  maxRadius: 100_000 + 1,
};

export const DEFAULT_NOISE_PARAMS = {
  octaves: 13,
  persistence: 0.707,
  lacunarity: 1.8,
  exponentiation: 4.5,
  height: 300.0,
  scale: 1100.0,
  seed,
  noiseType: NOISE_STYLES.simplex,
};

export const DEFAULT_TERRAIN_PARAMS = {
  wireframe: false,
  scale: 1_000,
  width: 1_000,
  chunkSize: 500,
  visible: true,
  subdivisions: 128,
};

export const DEFAULT_PLANET_PARAMS = {
  invert: false,
  radius: 1_000,
  minCellSize: 128 * 2,
  minCellResolution: 128,
};

export const DEFAULT_PLANET_PROPS = {
  noiseParams: DEFAULT_NOISE_PARAMS,
  colorNoiseParams: {
    octaves: 10,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 3.9,
    height: 64,
    scale: 256.0,
    noiseType: NOISE_STYLES.simplex,
    seed,
  },
  biomeParams: {
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 1,
    scale: 2048.0,
    noiseType: NOISE_STYLES.simplex,
    seed,
    height: 1,
  },
  colorGeneratorParams: DEFAULT_COLOR_PARAMS,
  minRadius: DEFAULT_HEIGHT_PARAMS.minRadius,
  maxRadius: DEFAULT_HEIGHT_PARAMS.maxRadius,
  width: DEFAULT_TERRAIN_PARAMS.width,
  radius: DEFAULT_PLANET_PARAMS.radius,
  invert: DEFAULT_PLANET_PARAMS.invert,
  minCellSize: DEFAULT_PLANET_PARAMS.minCellSize,
  minCellResolution: DEFAULT_PLANET_PARAMS.minCellResolution,
};

const DEFAULT_NUM_WORKERS = navigator?.hardwareConcurrency || 8;

export default class Planet {
  rootGroup = new THREE.Group();
  cubeFaceGroups = [...new Array(6)].map((_) => new THREE.Group());
  #builder: ChunkBuilderThreaded;
  material: THREE.Material;
  #chunkMap: ChunkMap = {};
  planetProps: PlanetProps = DEFAULT_PLANET_PROPS;
  // geology: Geology;
  constructor(numWorkers = DEFAULT_NUM_WORKERS) {
    this.#builder = new ChunkBuilderThreaded(numWorkers);
    // how to update materials...
    this.material = new THREE.MeshStandardMaterial({
      // wireframe: false,
      // wireframeLinewidth: 1,
      color: 0xffffff,
      side: THREE.DoubleSide,
      vertexColors: true,
    });
    this.rootGroup.add(...this.cubeFaceGroups);
    // this.geology = new Geology({ radius: this.planetProps.radius });
    // this.rootGroup.add(this.geology.mesh);
    // this.cubeFaceGroups.forEach((group) => (group.visible = false));
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
    // this.geology.rebuild({ radius: this.planetProps.radius });
  }

  update(anchor: THREE.Vector3) {
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
    q.insert(
      anchor
      // floatingOrigin.clone().add(floatingOrigin.clone().multiplyScalar(-1))
      // floatingOrigin.add(floatingOrigin.clone()).add(floatingOrigin.clone())
    );

    // this.rootGroup.position.add(floatingOrigin.clone().multiplyScalar(-1));

    const sides = q.getChildren();

    let newChunkMap: ChunkMap = {};
    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();
    for (let i = 0; i < sides.length; i++) {
      const cubeFaceRootGroup = this.cubeFaceGroups[i];
      cubeFaceRootGroup.matrix = sides[i].transform; // removed for floating origin
      cubeFaceRootGroup.matrixAutoUpdate = false;
      for (let cubeFaceChildChunk of sides[i].children) {
        cubeFaceChildChunk.bounds.getCenter(center);
        cubeFaceChildChunk.bounds.getSize(dimensions);

        const cubeFaceRootChunk: CubeFaceRootChunkProps = {
          type: ChunkTypes.ROOT,
          index: i,
          group: cubeFaceRootGroup,
          transform: cubeFaceRootGroup.matrix,
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
      const parentChunkProps = difference[key] as CubeFaceRootChunkProps;
      const offset = parentChunkProps.position.clone();
      newChunkMap[key] = {
        type: ChunkTypes.CHILD,
        position: new THREE.Vector2(offset.x, offset.z),
        chunk: this.#builder.allocateChunk({
          group: parentChunkProps.group,
          transform: parentChunkProps.transform,
          material: this.material,
          offset,
          noiseParams: this.planetProps.noiseParams,
          colorNoiseParams: this.planetProps.colorNoiseParams,
          biomeParams: this.planetProps.biomeParams,
          colorGeneratorParams: this.planetProps.colorGeneratorParams,
          heightGeneratorParams: {
            min: this.planetProps.minRadius,
            max: this.planetProps.maxRadius,
            // tileMap: this.geology.tileMap,
          },
          origin: anchor,
          width: parentChunkProps.size,
          radius: this.planetProps.radius,
          resolution: this.planetProps.minCellResolution,
          invert: this.planetProps.invert,
          isMinCellSize:
            parentChunkProps.size <= this.planetProps.radius / Math.PI,
        }),
      };
    }

    this.#chunkMap = newChunkMap;
  }
}
