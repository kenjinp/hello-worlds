import * as THREE from "three"
import { Material, Mesh, Object3D, ShaderMaterial, Vector3 } from "three"
import { ChunkGeneratedEvent, ChunkWillBeDisposedEvent } from "./Events"

export interface ChunkProps {
  group: Object3D
  material?: Material
  width: number
  height: number
  radius: number
  resolution: number
  offset: Vector3
  lodOrigin: Vector3
  inverted: boolean
  origin: Vector3
}

export interface ChunkRebuildProps {
  positions: ArrayBuffer
  colors: ArrayBuffer
  normals: ArrayBuffer
  uvs: ArrayBuffer
  textureSplatIndices: ArrayBuffer
  textureSplatStrengths: ArrayBuffer
  material?: Material
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
    this.offset = props.offset
    this.lodOrigin = props.lodOrigin
    this.origin = props.origin
    this.inverted = props.inverted
    this.castShadow = true
    this.receiveShadow = true
    // add ourselves to the parent group
    this.group.add(this)
    // this.dispatchEvent(new ChunkPendingEvent(this))
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

    // swap materials if requested
    if (data.material) {
      this.material = data.material
      this.material.needsUpdate = true
    }

    this.geometry.computeBoundingBox()
    this.geometry.computeBoundingSphere()

    this.dispatchEvent(new ChunkGeneratedEvent(this))
  }
}
