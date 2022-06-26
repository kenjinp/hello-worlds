import * as THREE from "three";
import { DoubleSide, MeshStandardMaterial } from "three";
import { AllocateChunkProps } from "./ChunkBuilderThreaded";

const material = new MeshStandardMaterial({ color: "blue", side: DoubleSide });

export default class ChunkThreaded {
  public plane: THREE.Mesh;
  public geometry: THREE.BufferGeometry;
  constructor(public params: AllocateChunkProps & { group: THREE.Object3D }) {
    this.geometry = new THREE.BufferGeometry();
    this.plane = new THREE.Mesh(this.geometry, params.material);
    this.plane.castShadow = false;
    this.plane.receiveShadow = true;
    this.plane.frustumCulled = !this.params.isMinCellSize;
    this.params.group.add(this.plane);
    this.plane.position.set(0, 0, 0);
    if (this.params.isMinCellSize) {
      this.plane.material = material;
    }
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

  // generateHeight(v: THREE.Vector3) {
  //   return this.params.heightGenerators[0].get(v.x, v.y, v.z)[0];
  // }

  // update(currentCameraPosition: THREE.Vector3) {
  //   // this.plane.position.copy(this.params.origin);
  //   // this.plane.position.sub(currentCameraPosition);
  // }

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
