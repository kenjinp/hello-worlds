import { Group, Material, Object3D, Sphere, Vector2, Vector3 } from "three"
import { Chunk } from "../chunk/Chunk"
import { makeRootChunkKey } from "../chunk/Chunk.helpers"
import {
  ChunkGeneratedEvent,
  ChunkPendingEvent,
  ChunkWillBeDisposedEvent,
} from "../chunk/Events"
import {
  ChunkMap,
  ChunkTypes,
  RootChunkProps,
  WORLD_TYPES,
} from "../chunk/types"
import { DEFAULT_LOD_DISTANCE_COMPARISON_VALUE } from "../defaults"
import { CubicQuadTree } from "../quadtree/CubicQuadTree"
import { dictDifference, dictIntersection } from "../utils"
import PlanetBuilder, { PlanetBuilderProps } from "./Planet.builder"

export interface PlanetProps<D> {
  radius: number
  inverted?: boolean
  minCellSize: number
  minCellResolution: number
  material?: Material
  position?: Vector3
  workerProps: PlanetBuilderProps<D>["workerProps"]
  lodDistanceComparisonValue?: number
  data: D
}

export class Planet<D = Record<string, any>> extends Object3D {
  #chunkMap: ChunkMap = {}
  #cubeFaceGroups = [...new Array(6)].map(_ => new Group())
  #builder: PlanetBuilder<D>
  #material?: Material
  #chunkSet = new Set<Chunk>()
  #chunks: Chunk[] = []
  readonly data: D
  minCellSize: number
  minCellResolution: number
  radius: number
  inverted: boolean
  lodDistanceComparisonValue: number
  sphere: Sphere
  readonly worldType = WORLD_TYPES.PLANET
  constructor({
    radius,
    minCellSize,
    minCellResolution,
    material,
    data,
    workerProps,
    position = new Vector3(),
    lodDistanceComparisonValue,
    inverted = false,
  }: PlanetProps<D>) {
    super()
    this.sphere = new Sphere(position, radius)
    this.position.copy(position)
    this.#builder = new PlanetBuilder<D>({
      workerProps,
      data,
      radius,
      inverted,
    })
    this.radius = radius
    this.#material = material
    this.minCellResolution = minCellResolution
    this.minCellSize = minCellSize
    this.data = data
    this.inverted = !!inverted
    this.lodDistanceComparisonValue =
      lodDistanceComparisonValue || DEFAULT_LOD_DISTANCE_COMPARISON_VALUE
    this.add(...this.#cubeFaceGroups)
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
    const q = new CubicQuadTree({
      radius: this.radius,
      minNodeSize: this.minCellSize,
      origin,
      comparatorValue: this.lodDistanceComparisonValue,
    })

    // collapse the quadtree recursively at this position
    q.insert(lodOrigin)

    const sides = q.getChildren()

    let newChunkMap: ChunkMap = {}
    const center = new Vector3()
    const dimensions = new Vector3()
    for (let i = 0; i < sides.length; i++) {
      const cubeFaceRootGroup = this.#cubeFaceGroups[i]
      cubeFaceRootGroup.matrix = sides[i].transform // removed for floating origin
      cubeFaceRootGroup.matrixAutoUpdate = false
      for (let cubeFaceChildChunk of sides[i].children) {
        cubeFaceChildChunk.bounds.getCenter(center)
        cubeFaceChildChunk.bounds.getSize(dimensions)

        const cubeFaceRootChunk: RootChunkProps = {
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
        radius: this.radius,
        resolution: this.minCellResolution,
        inverted: !!this.inverted,
        minCellSize: this.minCellSize,
      })
      allocatedChunk.addEventListener(ChunkGeneratedEvent.type, e => {
        const { chunk } = e as unknown as ChunkGeneratedEvent
        this.dispatchEvent(new ChunkGeneratedEvent(chunk))
        this.#chunkSet.add(chunk)
        this.#chunks = Array.from(this.#chunks.values()).sort((a, b) => {
          const aDist = a.position.distanceToSquared(lodOrigin)
          const bDist = a.position.distanceToSquared(lodOrigin)
          return bDist - aDist
        })
      })
      allocatedChunk.addEventListener(ChunkWillBeDisposedEvent.type, e => {
        const { chunk } = e as unknown as ChunkWillBeDisposedEvent
        this.dispatchEvent(new ChunkWillBeDisposedEvent(chunk))
        this.#chunkSet.delete(chunk)
        this.#chunks = Array.from(this.#chunks.values()).sort((a, b) => {
          const aDist = a.position.distanceToSquared(lodOrigin)
          const bDist = a.position.distanceToSquared(lodOrigin)
          return bDist - aDist
        })
      })
      allocatedChunk.addEventListener(ChunkPendingEvent.type, e => {
        const { chunk } = e as unknown as ChunkPendingEvent
        this.dispatchEvent(new ChunkPendingEvent(chunk))
      })
      this.dispatchEvent(new ChunkPendingEvent(allocatedChunk))

      newChunkMap[key] = {
        type: ChunkTypes.CHILD,
        position: new Vector2(offset.x, offset.z),
        chunk: allocatedChunk,
      }
    }

    this.#chunkMap = newChunkMap
  }

  get chunks() {
    return this.#chunks
  }

  dispose() {
    this.#builder.dispose()
  }
}
