import * as THREE from "three";

export interface ChunkThreadedParams<T = any> {
  group: THREE.Object3D;
  offset: THREE.Vector3;
  origin: THREE.Vector3;
  transform: THREE.Matrix4;
  material: THREE.Material;
  width: number;
  radius: number;
  resolution: number;
  invert: boolean;
  isMinCellSize: boolean;
  data: T;
}

export default class ChunkThreaded {
  public plane: THREE.Mesh;
  public geometry: THREE.BufferGeometry;
  constructor(public params: ChunkThreadedParams & { group: THREE.Object3D }) {
    this.geometry = new THREE.BufferGeometry();
    this.plane = new THREE.Mesh(this.geometry, params.material);
    // @ts-ignore
    if (this.params.material.uniforms) {
      // @ts-ignore
      params.material.uniforms.uWidth = { value: this.params.width };
      // @ts-ignore
      params.material.uniforms.uRadius = { value: this.params.radius };
      // @ts-ignore
      params.material.uniforms.uResolution = { value: this.params.resolution };
    }
    this.plane.castShadow = false;
    this.plane.receiveShadow = true;
    this.plane.frustumCulled = !this.params.isMinCellSize;
    this.params.group.add(this.plane);
    this.plane.position.set(0, 0, 0);
  }

  destroy() {
    this.params.group.remove(this.plane);
    this.plane.geometry.deleteAttribute("position");
    this.plane.geometry.deleteAttribute("color");
    this.plane.geometry.deleteAttribute("normal");
    this.plane.geometry.deleteAttribute("uv");
    this.plane.geometry.dispose(); // IMPORTANT!
  }

  hide() {
    this.plane.visible = false;
  }

  show() {
    this.plane.visible = true;
  }

  rebuildMeshFromData(data: any) {
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(data.positions, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(data.colours, 3)
    );
    this.geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(data.normals, 3)
    );
    this.geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(data.uvs, 2)
    );
  }
}
