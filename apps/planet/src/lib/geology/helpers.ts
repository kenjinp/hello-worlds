import * as THREE from "three";
import { BufferGeometry, MathUtils, Vector3 } from "three";
import { Face, HalfEdge } from "./Face";

export class EdgeHelper {
  public faces: Face[];
  public edges: HalfEdge[];
  constructor(geometry: BufferGeometry) {
    const { faces, edges } = getEdges(geometry);
    this.faces = faces;
    this.edges = edges;
  }

  get randomEdge() {
    return this.edges[MathUtils.randInt(0, this.edges.length - 1)];
  }

  getClosestEdge(vertex: Vector3) {}
}

export const getEdges = (geometry: BufferGeometry) => {
  const initialFaceColor = new THREE.Color(1, 1, 1);
  const { position } = geometry.attributes;
  const faces: Face[] = [];
  const edges: HalfEdge[] = [];
  let newFace;

  for (let faceIndex = 0; faceIndex < position.count / 3; faceIndex++) {
    newFace = new Face(
      new THREE.Vector3().fromBufferAttribute(position, faceIndex * 3 + 0),
      new THREE.Vector3().fromBufferAttribute(position, faceIndex * 3 + 1),
      new THREE.Vector3().fromBufferAttribute(position, faceIndex * 3 + 2),
      faceIndex
    );
    edges.push(newFace.edge);
    edges.push(newFace.edge.next);
    edges.push(newFace.edge.prev);
    newFace.color = initialFaceColor;
    faces.push(newFace);
  }

  /**
   * Find and connect twin Half-Edges
   *
   * if two Half-Edges are twins:
   * Edge A   TAIL ----> HEAD
   *           =          =
   * Edge B   HEAD <---- TAIL
   */
  // let currentEdge;
  // let nextEdge;
  // for (let j = 0; j < edges.length; j++) {
  //   currentEdge = edges[j];

  //   // this edge has a twin already; skip to next one
  //   if (currentEdge.twin !== null) continue;

  //   for (let k = j + 1; k < edges.length; k++) {
  //     nextEdge = edges[k];

  //     // this edge has a twin already; skip to next one
  //     if (nextEdge.twin !== null) continue;

  //     if (
  //       currentEdge.head().equals(nextEdge.tail()) &&
  //       currentEdge.tail().equals(nextEdge.head())
  //     ) {
  //       currentEdge.setTwin(nextEdge);
  //     }
  //   }
  // }
  function hash(p1: HalfEdge, p2: HalfEdge) {
    return JSON.stringify(p1) + JSON.stringify(p2);
  }
  const lookup: Record<string, any> = {};
  for (let j = 0; j < edges.length; j++) {
    const edge = edges[j];
    lookup[hash(edge.head(), edge.tail())] = edge;
  }
  for (let j = 0; j < edges.length; j++) {
    const edge = edges[j];
    const twin = lookup[hash(edge.tail(), edge.head())];
    !edge.twin && twin && !twin.twin && edge.setTwin(twin);
  }
  return { faces, edges };
};
