import * as THREE from "three";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";
import { Generator3 } from "../generators/Generator3";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export interface ChunkProps {
  invert: boolean;
  name: string;
  width: number;
  scale: number;
  radius: number;
  subdivisions: number;
  resolution: number;
  offset: THREE.Vector3;
  heightGenerators: Generator3<[number, number]>[];
  colourGenerator: Generator3<THREE.Color>;
  wireframe: boolean;
  visible: boolean;
  group: THREE.Object3D;
  material: THREE.Material;
}

export default class Chunk {
  public plane: THREE.Mesh;
  public geometry: THREE.BufferGeometry;
  constructor(public params: ChunkProps) {
    this.geometry = new THREE.BufferGeometry();
    this.params.group.frustumCulled = false;
    this.plane = new THREE.Mesh(this.geometry, params.material);
    this.plane.castShadow = false;
    this.plane.receiveShadow = true;
    this.params.group.add(this.plane);
  }

  destroy() {
    console.log("destroy");
    this.params.group.remove(this.plane);
  }

  hide() {
    this.plane.visible = false;
  }

  show() {
    this.plane.visible = true;
  }

  generateHeight(v: THREE.Vector3) {
    return this.params.heightGenerators[0].get(v.x, v.y, v.z)[0];
  }

  *rebuild() {
    const _D = new THREE.Vector3();
    const _D1 = new THREE.Vector3();
    const _D2 = new THREE.Vector3();
    const localPosition = new THREE.Vector3();
    const _H = new THREE.Vector3();
    const worldPosition = new THREE.Vector3();
    const _N = new THREE.Vector3();
    const _N1 = new THREE.Vector3();
    const _N2 = new THREE.Vector3();
    const _N3 = new THREE.Vector3();

    const positions = [];
    const colors = [];
    const normals = [];
    const tangents = [];
    const uvs = [];
    const indices = [];

    const localToWorld = this.params.group.matrix;
    const resolution = this.params.resolution;
    const radius = this.params.radius;
    const offset = this.params.offset;
    const width = this.params.width;

    const half = width / 2;

    for (let x = 0; x < resolution + 1; x++) {
      const xp = (width * x) / resolution;
      for (let y = 0; y < resolution + 1; y++) {
        const yp = (width * y) / resolution;

        // Compute position
        localPosition.set(xp - half, yp - half, radius);
        localPosition.add(offset);
        localPosition.normalize();
        _D.copy(localPosition);
        localPosition.multiplyScalar(radius);
        localPosition.z -= radius;

        // Compute a world space position to sample noise
        worldPosition.copy(localPosition);
        worldPosition.applyMatrix4(localToWorld);

        const height = this.generateHeight(worldPosition.clone());
        worldPosition.normalize(); // VERY IMPORTANT!
        const color = this.params.colourGenerator.get(
          worldPosition.x,
          worldPosition.y,
          height
        );

        // Purturb height along z-vector
        _H.copy(_D);
        _H.multiplyScalar(height * (this.params.invert ? -1 : 1));
        localPosition.add(_H);

        positions.push(localPosition.x, localPosition.y, localPosition.z);
        // localPosition.normalize();

        colors.push(color.r, color.g, color.b);

        // colors.push(localPosition.x, localPosition.y, localPosition.z);
        normals.push(_D.x, _D.y, _D.z);
        tangents.push(1, 0, 0, 1);
        uvs.push(localPosition.x / 10, localPosition.y / 10);
      }
    }
    yield;

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        indices.push(
          i * (resolution + 1) + j,
          (i + 1) * (resolution + 1) + j + 1,
          i * (resolution + 1) + j + 1
        );
        indices.push(
          (i + 1) * (resolution + 1) + j,
          (i + 1) * (resolution + 1) + j + 1,
          i * (resolution + 1) + j
        );
      }
    }
    yield;

    for (let i = 0, n = indices.length; i < n; i += 3) {
      const i1 = indices[i] * 3;
      const i2 = indices[i + 1] * 3;
      const i3 = indices[i + 2] * 3;

      _N1.fromArray(positions, i1);
      _N2.fromArray(positions, i2);
      _N3.fromArray(positions, i3);

      _D1.subVectors(_N3, _N2);
      _D2.subVectors(_N1, _N2);
      _D1.cross(_D2);

      normals[i1] += _D1.x;
      normals[i2] += _D1.x;
      normals[i3] += _D1.x;

      normals[i1 + 1] += _D1.y;
      normals[i2 + 1] += _D1.y;
      normals[i3 + 1] += _D1.y;

      normals[i1 + 2] += _D1.z;
      normals[i2 + 2] += _D1.z;
      normals[i3 + 2] += _D1.z;
    }
    yield;

    for (let i = 0, n = normals.length; i < n; i += 3) {
      _N.fromArray(normals, i);
      _N.normalize();
      normals[i] = _N.x;
      normals[i + 1] = _N.y;
      normals[i + 2] = _N.z;
    }
    yield;

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    this.geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    );
    this.geometry.setAttribute(
      "tangent",
      new THREE.Float32BufferAttribute(tangents, 4)
    );
    this.geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(indices), 1)
    );

    yield;

    this.geometry.computeBoundsTree();
  }
}
