import * as THREE from "three";
import { AllocateChunkProps } from "./ChunkBuilderThreaded";

export default class ChunkThreaded {
  public plane: THREE.Mesh;
  public geometry: THREE.BufferGeometry;
  constructor(public params: AllocateChunkProps & { group: THREE.Object3D }) {
    this.geometry = new THREE.BufferGeometry();
    this.plane = new THREE.Mesh(this.geometry, params.material);
    this.plane.castShadow = false;
    this.plane.receiveShadow = true;
    this.plane.frustumCulled = false;
    this.params.group.add(this.plane);
    this.plane.position.set(0, 0, 0);
    // this.reinit(params);
  }

  destroy() {
    this.params.group.remove(this.plane);
  }

  hide() {
    this.plane.visible = false;
  }

  show() {
    this.plane.visible = true;
  }

  // generateHeight(v: THREE.Vector3) {
  //   return this.params.heightGenerators[0].get(v.x, v.y, v.z)[0];
  // }

  update(currentCameraPosition: THREE.Vector3) {
    this.plane.position.copy(this.params.origin);
    this.plane.position.sub(currentCameraPosition);
  }

  // reinit(params: AllocateChunkProps & { group: THREE.Object3D }) {
  //   this.params = params;
  // }

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
