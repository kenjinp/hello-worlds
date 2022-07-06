import { Vector3 } from "three";

export default class Tile {
  neighbors: Tile[] = [];
  data: Record<string, any> = {};
  constructor(public position: Vector3, myData: Record<string, any> = {}) {
    this.data = myData;
  }
  addNeighbor(tile: Tile) {
    this.neighbors.push(tile);
  }
}
