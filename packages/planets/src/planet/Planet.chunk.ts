import { BufferAttribute, BufferGeometry, Float32BufferAttribute } from "three"
import { MeshBVH } from "three-mesh-bvh"
import { BuildChunkInitialParams, ChunkGeneratorProps } from "../chunk/types"
import { fixEdgeSkirt } from "./chunk-helpers/fixEdgeSkirts"
import { generateIndices } from "./chunk-helpers/generateIndices"
import { generateInitialHeights } from "./chunk-helpers/generateInitialHeights"
import { generateNormals } from "./chunk-helpers/generateNormals"
import { normalizeNormals } from "./chunk-helpers/normalizeNormals"

export function buildPlanetChunk<D>(initialParams: BuildChunkInitialParams<D>) {
  const { heightGenerator, colorGenerator, terrainSplatGenerator } =
    initialParams

  const geo = new BufferGeometry()

  return function runBuildChunk(params: ChunkGeneratorProps<D>) {
    const { resolution, origin, width, offset, radius, inverted } = params

    // generate the chunk geometry
    const { positions, positionsWithoutSkirt, colors, coords, up } =
      generateInitialHeights({
        ...params,
        heightGenerator,
        colorGenerator,
      })

    // Generate indices
    const indices = generateIndices(resolution)
    const indicesWithoutSkirt = generateIndices(resolution - 2)
    // Get Normals
    const normals = generateNormals(positions, indices)

    // Pull the skirt vertices down away from the surface
    fixEdgeSkirt(resolution, positions, up, normals, width, radius, inverted)

    // fix the normals
    normalizeNormals(normals)

    // TODO: allow users to create their own buffers (for terrain splatting or object scattering)
    const bytesInFloat32 = 4
    const bytesInInt32 = 4
    const positionsArray = new Float32Array(
      new SharedArrayBuffer(bytesInFloat32 * positions.length),
    )
    const positionsWithoutSkirtArray = new Float32Array(
      new SharedArrayBuffer(bytesInFloat32 * positionsWithoutSkirt.length),
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
    const indicesArray = new Uint32Array(
      new SharedArrayBuffer(bytesInInt32 * indices.length),
    )
    const indicesWithoutSkirtArray = new Uint32Array(
      new SharedArrayBuffer(bytesInInt32 * indicesWithoutSkirt.length),
    )

    // TODO: improve performance by using the typed arrays directly
    positionsArray.set(positions, 0)
    // positionsWithoutSkirtArray.set(positionsWithoutSkirt, 0)
    colorsArray.set(colors, 0)
    normalsArray.set(normals, 0)
    coordsArray.set(coords, 0)
    indicesArray.set(indices, 0)
    // indicesWithoutSkirtArray.set(indicesWithoutSkirt, 0)

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
    }
  }
}
