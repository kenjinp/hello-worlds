import { BufferAttribute, BufferGeometry, Float32BufferAttribute } from "three"
import { MeshBVH } from "three-mesh-bvh"
import { BuildChunkInitialParams, ChunkGeneratorProps } from "../chunk/types"
import { generateHeightmapBitmap } from "../heightmaps/Heightmap"
import { fixEdgeSkirt } from "./chunk-helpers/fixEdgeSkirts"
import { generateIndices } from "./chunk-helpers/generateIndices"
import { generateInitialHeights } from "./chunk-helpers/generateInitialHeights"
import { generateNormals } from "./chunk-helpers/generateNormals"

export function buildFlatWorldChunk<D>(
  initialParams: BuildChunkInitialParams<D>,
) {
  const { heightGenerator, colorGenerator, terrainSplatGenerator } =
    initialParams

  const geo = new BufferGeometry()

  return function runBuildChunk(params: ChunkGeneratorProps<D>) {
    const { resolution, origin, width, offset, radius: size, inverted } = params

    // generate the chunk geometry
    const {
      positions,
      colors,
      coords,
      up,
      heights,
      heightsMax,
      heightsMin,
      localCoords,
    } = generateInitialHeights({
      ...params,
      heightGenerator,
      colorGenerator,
    })

    // Generate indices
    const indices = generateIndices(resolution)
    // Get Normals
    const normals = generateNormals(positions, indices)

    // Pull the skirt vertices down away from the surface
    fixEdgeSkirt(resolution, positions, up, normals, width, size, inverted)
    const heightmap = generateHeightmapBitmap(heights, heightsMin, heightsMax)

    // TODO: allow users to create their own buffers (for terrain splatting or object scattering)
    const bytesInFloat32 = 4
    const bytesInInt32 = 4
    const positionsArray = new Float32Array(
      new SharedArrayBuffer(bytesInFloat32 * positions.length),
    )
    const colorsArray = new Float32Array(
      new SharedArrayBuffer(bytesInFloat32 * colors.length),
    )
    const normalsArray = new Float32Array(
      new SharedArrayBuffer(bytesInFloat32 * normals.length),
    )
    const coordsArray = new Float32Array(
      new SharedArrayBuffer(bytesInFloat32 * coords.length),
    )
    const localCoordsArray = new Float32Array(
      new SharedArrayBuffer(bytesInFloat32 * localCoords.length),
    )
    const indicesArray = new Uint32Array(
      new SharedArrayBuffer(bytesInInt32 * indices.length),
    )
    const heightsArray = new Uint8Array(
      new SharedArrayBuffer(1 * heightmap.length),
    )

    // TODO: improve performance by using the typed arrays directly
    positionsArray.set(positions, 0)
    colorsArray.set(colors, 0)
    normalsArray.set(normals, 0)
    coordsArray.set(coords, 0)
    localCoordsArray.set(localCoords, 0)
    indicesArray.set(indices, 0)
    heightsArray.set(heightmap, 0)

    geo.setAttribute("position", new Float32BufferAttribute(positionsArray, 3))
    geo.setIndex(new BufferAttribute(new Uint32Array(indicesArray), 1))
    const bvh = new MeshBVH(geo)
    const serializedBVH = MeshBVH.serialize(bvh)

    return {
      positions: positionsArray,
      colors: colorsArray,
      normals: normalsArray,
      uvs: coordsArray,
      indices: indicesArray,
      bvh: serializedBVH,
      heightmap: heightsArray,
      minHeight: heightsMin,
      maxHeight: heightsMax,
      localUvs: localCoordsArray,
    }
  }
}
