import { Group, Material, Vector2, Vector3 } from "three"
import { makeRootChunkKey } from "../chunk/Chunk.helpers"
import { ChunkMap, ChunkTypes, RootChunkProps } from "../chunk/types"
import { PlanetBuilderProps } from "../planet/Planet.builder"
import { dictDifference, dictIntersection } from "../utils"
import RingWorldBuilder from "./RingWorld.builder"
import { RingWorldQuadTree } from "./RingWorld.quadTree"

export interface RingWorldProps<D> {
  radius: number
  length: number
  inverted?: boolean
  minCellSize: number
  minCellResolution: number
  material?: Material
  position: Vector3
  workerProps: PlanetBuilderProps<D>["workerProps"]
  data: D
}

export class RingWorld<D = Record<string, any>> extends Group {
  #chunkMap: ChunkMap = {}
  #segmentGroups = [...new Array(4)].map(_ => new Group())
  #builder: RingWorldBuilder<D>
  readonly data: D
  material?: Material
  minCellSize: number
  minCellResolution: number
  radius: number
  length: number
  inverted: boolean

  constructor({
    radius,
    length,
    minCellSize,
    minCellResolution,
    material,
    workerProps,
    data,
    position,
    inverted = false,
  }: RingWorldProps<D>) {
    super()
    console.log("NEW RING WORLD")
    this.position.copy(position)
    this.data = data
    this.length = length
    this.radius = radius
    this.material = material
    this.minCellResolution = minCellResolution
    this.minCellSize = minCellSize
    this.#builder = new RingWorldBuilder<D>({
      workerProps,
      data,
      radius,
      inverted,
      length,
    })
    this.inverted = inverted
    this.add(...this.#segmentGroups)
  }

  // to re-apply parameter changes, for example
  rebuild() {
    this.#builder.rebuild(this.#chunkMap)
  }

  update(lodOrigin: Vector3) {
    this.#builder.update()
    if (this.#builder.busy) {
      return
    }

    // where should we compare the LOD resolution to?
    const origin = this.position

    // update visible chunks quadtree
    const q = new RingWorldQuadTree({
      radius: this.radius,
      minNodeSize: this.minCellSize,
      origin,
      length: this.length,
    })

    // collapse the quadtree recursively at this position
    q.insert(lodOrigin)

    const sides = q.getChildren()

    let newChunkMap: ChunkMap = {}
    const center = new Vector3()
    const dimensions = new Vector3()
    for (let i = 0; i < sides.length; i++) {
      const cubeFaceRootGroup = this.#segmentGroups[i]
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
      newChunkMap[key] = {
        type: ChunkTypes.CHILD,
        position: new Vector2(offset.x, offset.z),
        chunk: this.#builder.allocateChunk({
          group: parentChunkProps.group,
          material: this.material,
          offset,
          lodOrigin: lodOrigin,
          origin: this.position,
          width: parentChunkProps.size,
          radius: this.radius,
          length: this.length,
          resolution: this.minCellResolution,
          inverted: !!this.inverted,
        }),
      }
    }

    this.#chunkMap = newChunkMap
  }

  dispose() {
    console.log("goodbye ring world!")
    this.#builder.dispose()
  }
}
