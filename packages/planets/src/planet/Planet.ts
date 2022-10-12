import { random } from "@hello-worlds/core"
import * as THREE from "three"
import { Vector3 } from "three"
import ChunkBuilderThreaded from "../chunk/ChunkBuilderThreaded"
import ChunkThreaded from "../chunk/ChunkThreaded"
import { NOISE_STYLES } from "../noise/Noise"
import { CubicQuadTree } from "../quadtree/CubicQuadTree"
import { dictDifference, dictIntersection } from "../utils"

export enum ChunkTypes {
  ROOT = "ROOT",
  CHILD = "CHILD",
}

// These root chunks host the interior children chunks
export interface CubeFaceRootChunkProps {
  index: number
  type: ChunkTypes.ROOT
  size: number
  group: THREE.Object3D
  position: THREE.Vector3
  transform: THREE.Matrix4
  bounds: THREE.Box3
}

export interface CubeFaceChildChunkProps {
  type: ChunkTypes.CHILD
  position: THREE.Vector2
  chunk: ChunkThreaded
}

export type ChunkMap = Record<
  string,
  CubeFaceRootChunkProps | CubeFaceChildChunkProps
>

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
  )
}

const seed = (random() + 1).toString(36).substring(7)

export interface PlanetProps {
  radius: number
  invert?: boolean
  minCellSize: number
  minCellResolution: number
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
}

export const DEFAULT_NOISE_PARAMS = {
  octaves: 13,
  persistence: 0.707,
  lacunarity: 1.8,
  exponentiation: 4.5,
  height: 300.0,
  scale: 1100.0,
  seed,
  noiseType: NOISE_STYLES.simplex,
}

export const DEFAULT_TERRAIN_PARAMS = {
  wireframe: false,
  scale: 1_000,
  width: 1_000,
  chunkSize: 500,
  visible: true,
  subdivisions: 128,
}

export const DEFAULT_PLANET_PARAMS = {
  invert: false,
  radius: 1_000,
  minCellSize: 128 * 2,
  minCellResolution: 128,
}

export const DEFAULT_PLANET_PROPS = {
  radius: DEFAULT_PLANET_PARAMS.radius,
  invert: DEFAULT_PLANET_PARAMS.invert,
  minCellSize: DEFAULT_PLANET_PARAMS.minCellSize,
  minCellResolution: DEFAULT_PLANET_PARAMS.minCellResolution,
}

const DEFAULT_NUM_WORKERS = navigator?.hardwareConcurrency || 8

const tempVec3 = new Vector3()

export class Planet<T = {}, I = {}> {
  rootGroup = new THREE.Group()
  cubeFaceGroups = [...new Array(6)].map(_ => new THREE.Group())
  #builder: ChunkBuilderThreaded<T, I>
  #material: THREE.Material
  #chunkMap: ChunkMap = {}
  #currentData: T | null = null
  constructor(
    public planetProps: PlanetProps = DEFAULT_PLANET_PROPS,
    initialData: I,
    worker: new () => Worker,
    numWorkers = DEFAULT_NUM_WORKERS,
  ) {
    this.#builder = new ChunkBuilderThreaded<T, I>(
      numWorkers,
      worker,
      {
        ...planetProps,
        initialData,
      } as unknown as PlanetProps & I,
      this.rootGroup.uuid,
    )
    // how to update materials...
    this.#material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
    })
    this.rootGroup.add(...this.cubeFaceGroups)
  }

  get material() {
    return this.#material
  }

  set material(mat) {
    this.#material = mat
    this.rebuild(this.#currentData!)
  }

  // for debugging threads
  get busyInfo() {
    return {
      busy: this.#builder.busy,
      busyLength: this.#builder.busyLength,
      queueLength: this.#builder.queueLength,
    }
  }

  // async getElevationAtPosition (position: Vector3) {

  // }

  // to re-apply parameter changes, for example
  rebuild(data: T) {
    this.#currentData = data
    this.#builder.rebuild(this.#chunkMap, data, this.#material)
  }

  update(lodOrigin: THREE.Vector3, data: T) {
    if (!this.planetProps) {
      throw new Error("must set planetProps before updating")
    }
    this.#currentData = data
    this.#builder.update()
    if (this.#builder.busy) {
      return
    }

    const origin = this.rootGroup.getWorldPosition(tempVec3)
    // update visible chunks quadtree
    const q = new CubicQuadTree({
      radius: this.planetProps.radius,
      minNodeSize: this.planetProps.minCellSize,
      origin,
    })

    // collapse the quadtree recursively at this position
    q.insert(
      lodOrigin.clone(),
      // floatingOrigin.clone().add(floatingOrigin.clone().multiplyScalar(-1))
      // floatingOrigin.add(floatingOrigin.clone()).add(floatingOrigin.clone())
    )

    // this.rootGroup.position.add(floatingOrigin.clone().multiplyScalar(-1));

    const sides = q.getChildren()

    let newChunkMap: ChunkMap = {}
    const center = new THREE.Vector3()
    const dimensions = new THREE.Vector3()
    for (let i = 0; i < sides.length; i++) {
      const cubeFaceRootGroup = this.cubeFaceGroups[i]
      cubeFaceRootGroup.matrix = sides[i].transform // removed for floating origin
      cubeFaceRootGroup.matrixAutoUpdate = false
      for (let cubeFaceChildChunk of sides[i].children) {
        cubeFaceChildChunk.bounds.getCenter(center)
        cubeFaceChildChunk.bounds.getSize(dimensions)

        const cubeFaceRootChunk: CubeFaceRootChunkProps = {
          type: ChunkTypes.ROOT,
          index: i,
          group: cubeFaceRootGroup,
          transform: cubeFaceRootGroup.matrix,
          position: center.clone(),
          bounds: cubeFaceChildChunk.bounds.clone(),
          size: dimensions.x,
        }

        const key = makeRootChunkKey(cubeFaceRootChunk)
        newChunkMap[key] = cubeFaceRootChunk
      }
    }

    const intersection = dictIntersection(this.#chunkMap, newChunkMap)
    const difference = dictDifference(newChunkMap, this.#chunkMap)
    const recycle = Object.values(dictDifference(this.#chunkMap, newChunkMap))

    this.#builder.retireChunks(recycle)

    newChunkMap = intersection

    // Now let's build the children chunks who actually show terrain detail
    for (let key in difference) {
      const parentChunkProps = difference[key] as CubeFaceRootChunkProps
      const offset = parentChunkProps.position.clone()
      newChunkMap[key] = {
        type: ChunkTypes.CHILD,
        position: new THREE.Vector2(offset.x, offset.z),
        chunk: this.#builder.allocateChunk({
          group: parentChunkProps.group,
          transform: parentChunkProps.transform,
          material: this.#material,
          offset,
          origin: lodOrigin.clone(),
          width: parentChunkProps.size,
          radius: this.planetProps.radius,
          resolution: this.planetProps.minCellResolution,
          invert: !!this.planetProps.invert,
          isMinCellSize:
            parentChunkProps.size <= this.planetProps.radius / Math.PI,
          data,
        }),
      }
    }

    this.#chunkMap = newChunkMap
  }

  destroy() {
    this.#builder.destroy()
  }
}
