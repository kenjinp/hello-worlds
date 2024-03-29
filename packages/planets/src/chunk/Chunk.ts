import * as THREE from "three"
import { Material, Mesh, Object3D, ShaderMaterial, Vector3 } from "three"
import { MeshBVH, SerializedBVH } from "three-mesh-bvh"
import { getLODTable } from "../utils"
import { ChunkGeneratedEvent, ChunkWillBeDisposedEvent } from "./Events"

export interface ChunkProps {
  group: Object3D
  material?: Material
  width: number
  height: number
  radius: number
  resolution: number
  minCellSize: number
  offset: Vector3
  lodOrigin: Vector3
  inverted: boolean
  origin: Vector3
  skirtDepth?: number
}

export interface ChunkRebuildProps {
  positions: ArrayBuffer
  colors: ArrayBuffer
  normals: ArrayBuffer
  uvs: ArrayBuffer
  localUvs: ArrayBuffer
  indices: ArrayBuffer
  textureSplatIndices: ArrayBuffer
  textureSplatStrengths: ArrayBuffer
  material?: Material
  bvh: SerializedBVH
  heightmap?: ArrayBuffer
  minHeight: number
  maxHeight: number
}

// This represents a single terrain tile
export class Chunk extends Mesh {
  group: Object3D
  width: number
  height: number
  radius: number
  resolution: number
  offset: Vector3
  lodOrigin: Vector3
  origin: Vector3
  inverted: boolean
  minCellSize: number
  minHeight: number = 0
  maxHeight: number = 0
  lodTable: ReturnType<typeof getLODTable>
  lodLength: number
  heightmap?: ArrayBuffer

  constructor(props: ChunkProps) {
    // let's build ourselves a mesh with the base material
    super(new THREE.BufferGeometry(), props.material)
    // provide shader default uniforms
    if ((props.material as ShaderMaterial).uniforms) {
      ;(props.material as ShaderMaterial).uniforms.uWidth = {
        value: props.width,
      }
      ;(props.material as ShaderMaterial).uniforms.uRadius = {
        value: props.radius,
      }
      ;(props.material as ShaderMaterial).uniforms.uResolution = {
        value: props.resolution,
      }
    }
    this.group = props.group
    this.width = props.width
    this.height = props.height
    this.radius = props.radius
    this.resolution = props.resolution
    this.minCellSize = props.minCellSize
    this.offset = props.offset
    this.lodOrigin = props.lodOrigin
    this.origin = props.origin
    this.inverted = props.inverted
    this.castShadow = true
    this.receiveShadow = true
    // add ourselves to the parent group
    this.group.add(this)
    this.lodTable = getLODTable(this.radius, this.minCellSize)
    this.lodLength = Object.values(this.lodTable).length
  }

  get lodLevel() {
    // 0 is the highest res
    const LODratio = this.minCellSize / this.width
    const LODRatios = Array.from(Object.values(this.lodTable)).sort(
      (a, b) => b - a,
    )
    const LODIndex = LODRatios.indexOf(LODratio)
    return LODIndex < 0 ? LODRatios.length + 1 : LODIndex
  }

  dispose() {
    this.dispatchEvent(new ChunkWillBeDisposedEvent(this))
    // we have to dispose of all the attributes associated with this mesh
    this.group.remove(this)
    this.geometry.deleteAttribute("position")
    this.geometry.deleteAttribute("color")
    this.geometry.deleteAttribute("normal")
    this.geometry.deleteAttribute("uv")
    this.geometry.dispose() // IMPORTANT!
  }

  hide() {
    this.visible = false
  }

  show() {
    this.visible = true
  }

  rebuildMeshFromData(data: ChunkRebuildProps) {
    this.minHeight = data.minHeight
    this.maxHeight = data.maxHeight

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(data.positions, 3),
    )
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(data.colors, 4),
    )
    this.geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(data.normals, 3),
    )
    this.geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(data.uvs, 2),
    )
    this.geometry.setAttribute(
      "localUvs",
      new THREE.Float32BufferAttribute(data.localUvs, 2),
    )
    this.geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(data.indices), 1),
    )
    if (!!data.textureSplatIndices && !!data.textureSplatStrengths) {
      this.geometry.setAttribute(
        "textureSplatIndices",
        new THREE.Float32BufferAttribute(data.textureSplatIndices, 4),
      )
      this.geometry.setAttribute(
        "textureSplatStrengths",
        new THREE.Float32BufferAttribute(data.textureSplatStrengths, 4),
      )
    }

    if (data.heightmap) {
      this.heightmap = data.heightmap
    }

    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.normal.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true

    // swap materials if requested
    if (data.material) {
      this.material = data.material
      this.material.needsUpdate = true
    }
    const deserializedBVH = MeshBVH.deserialize(data.bvh, this.geometry)
    this.geometry.boundsTree = deserializedBVH

    this.geometry.computeBoundingBox()
    this.geometry.computeBoundingSphere()

    // TODO for some reason this fires but indices.count is undefined!
    this.dispatchEvent(new ChunkGeneratedEvent(this))
  }
}
