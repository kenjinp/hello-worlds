import { Material, Object3D, Vector2, Vector3 } from "three"
import { makeRootChunkKey } from "../chunk/Chunk.helpers"
import { ChunkGeneratedEvent, ChunkWillBeDisposedEvent } from "../chunk/Events"
import {
  ChunkMap,
  ChunkTypes,
  RootChunkProps,
  WORLD_TYPES,
} from "../chunk/types"
import { DEFAULT_LOD_DISTANCE_COMPARISON_VALUE } from "../defaults"
import { dictDifference, dictIntersection } from "../utils"
import FlatWorldBuilder, { FlatWorldBuilderProps } from "./FlatWorld.builder"
import { FlatWorldsQuadTree } from "./FlatWorlds.quadtree"

export interface FlatWorldProps<D> {
  inverted?: boolean
  size: number
  minCellSize: number
  minCellResolution: number
  material?: Material
  position: Vector3
  workerProps: FlatWorldBuilderProps<D>["workerProps"]
  data: D
  lodDistanceComparisonValue?: number
}

export class FlatWorld<D = Record<string, any>> extends Object3D {
  #chunkMap: ChunkMap = {}
  #builder: FlatWorldBuilder<D>
  #material?: Material
  readonly data: D
  minCellSize: number
  minCellResolution: number
  size: number
  inverted: boolean
  lodDistanceComparisonValue: number
  readonly worldType = WORLD_TYPES.FLAT_WORLD
  constructor({
    minCellSize,
    minCellResolution,
    material,
    data,
    workerProps,
    position,
    size,
    lodDistanceComparisonValue,
    inverted = false,
  }: FlatWorldProps<D>) {
    super()
    this.size = size
    this.position.copy(position)
    this.#builder = new FlatWorldBuilder<D>({
      workerProps,
      data,
      inverted,
    })
    this.lodDistanceComparisonValue =
      lodDistanceComparisonValue || DEFAULT_LOD_DISTANCE_COMPARISON_VALUE
    this.#material = material
    this.minCellResolution = minCellResolution
    this.minCellSize = minCellSize
    this.data = data
    this.inverted = !!inverted
  }

  get material(): Material | undefined {
    return this.#material
  }

  set material(material: Material | undefined) {
    if (material) {
      for (let key in this.#chunkMap) {
        const chunk = this.#chunkMap[key]
        if (chunk.type === ChunkTypes.CHILD) {
          chunk.chunk.material = material
        }
      }
    }
    this.#material = material
  }

  // this will cause all the chunks to reform
  // use this to update planet parameters
  rebuild() {
    this.#builder.rebuild(this.#chunkMap)
  }

  // this will resolve the LOD
  // you can call this each frame with a camera
  update(lodOrigin: Vector3) {
    this.#builder.update()
    if (this.#builder.busy) {
      return
    }

    const origin = this.position

    // update visible chunks quadtree
    const q = new FlatWorldsQuadTree({
      size: this.size / 2,
      localToWorld: this.matrixWorld,
      minNodeSize: this.minCellSize,
      origin,
      comparatorValue: this.lodDistanceComparisonValue,
    })

    // collapse the quadtree recursively at this position
    q.insert(lodOrigin)

    const children = q.getChildren()

    let newChunkMap: ChunkMap = {}
    const center = new Vector3()
    const dimensions = new Vector3()

    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      node.bounds.getCenter(center)
      node.bounds.getSize(dimensions)

      const cubeFaceRootChunk: RootChunkProps = {
        type: ChunkTypes.ROOT,
        index: i,
        group: this,
        transform: this.matrix,
        position: center.clone(),
        bounds: node.bounds.clone(),
        size: dimensions.x,
      }

      const key = makeRootChunkKey(cubeFaceRootChunk)
      newChunkMap[key] = cubeFaceRootChunk
    }

    const intersection = dictIntersection(this.#chunkMap, newChunkMap)
    const difference = dictDifference(newChunkMap, this.#chunkMap)
    const recycle = Object.values(dictDifference(this.#chunkMap, newChunkMap))

    this.#builder.retireChunks(recycle)

    newChunkMap = intersection

    // Now let's build the children chunks who actually show terrain detail
    for (let key in difference) {
      const parentChunkProps = difference[key] as RootChunkProps
      const offset = parentChunkProps.position
      const allocatedChunk = this.#builder.allocateChunk({
        group: parentChunkProps.group,
        material: this.#material,
        offset,
        lodOrigin,
        origin: this.position,
        width: parentChunkProps.size,
        height: parentChunkProps.size,
        radius: this.size / 2,
        resolution: this.minCellResolution,
        minCellSize: this.minCellSize,
        inverted: !!this.inverted,
      })
      allocatedChunk.addEventListener(ChunkGeneratedEvent.type, e => {
        const { chunk } = e as unknown as ChunkGeneratedEvent
        this.dispatchEvent(new ChunkGeneratedEvent(chunk))
      })
      allocatedChunk.addEventListener(ChunkWillBeDisposedEvent.type, e => {
        const { chunk } = e as unknown as ChunkWillBeDisposedEvent
        this.dispatchEvent(new ChunkWillBeDisposedEvent(chunk))
      })
      newChunkMap[key] = {
        type: ChunkTypes.CHILD,
        position: new Vector2(offset.x, offset.z),
        chunk: allocatedChunk,
      }
    }

    this.#chunkMap = newChunkMap
  }

  dispose() {
    this.#builder.dispose()
  }
}
