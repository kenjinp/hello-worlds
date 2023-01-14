import { cellsToMultiPolygon, CoordPair, latLngToCell } from "h3-js"
import { MathUtils, Vector3 } from "three"
import { LatLong } from "./LatLong"
import { randomFloodFill } from "./Tectonics.floodfill"

export const HEX_GRID_RESOLUTION = 3

export class PlateBoundary {
  constructor(public readonly plateA: Plate, public readonly plateB: Plate) {}
}

export class Plate<T = any> {
  neighbors = new Set<string>()
  name: string
  indices = new Set<string>()
  uuid = MathUtils.generateUUID()
  polygon: CoordPair[][][]
  externalEdges = new Set<string>()
  internalEdges = new Set<string>()
  constructor(public readonly origin: LatLong, public data: T) {
    // console.log(cellsToMultiPolygon(hexagons, true))
  }
  static generatePolygon(plate: Plate) {
    plate.polygon = cellsToMultiPolygon(Array.from(plate.indices))
  }
  // static getEdgesAtPosition(plate: Plate, position: Vector3) {
  //   const latLong = LatLong.cartesianToLatLong(position)
  //   const cell = latLngToCell(latLong.lat, latLong.lon, HEX_GRID_RESOLUTION)
  //   const parent = cellToParent(cell, Math.max(1, HEX_GRID_RESOLUTION - 1))
  //   const children = cellToChildren(parent, HEX_GRID_RESOLUTION)

  //   const edgesToCheck = []
  //   // for (const child of children) {
  //   //   if (plate.internalEdges.has(child)) {
  //   //     const ll = cellToLatLng(child, HEX_GRID_RESOLUTION)
  //   //     position.distanceTo()
  //   //   }
  //   // }

  //   // const edges = Plate.getEdges(cell)
  //   // const edge = edges[0]
  //   return edge
  // }
  // getPolygon() {
  //   const set = new Set(this.indices)
  //   const cells = cellsToMultiPolygon(Array.from(set))
  //   return cells
  // }
  // static getPolygon<T = any>(plate: Plate<T>) {
  //   return cellsToMultiPolygon(plate.indices)
  // }
}

export interface TectonicsProps<T> {
  numberOfPlates: number
  origin: Vector3
  radius: number
  resolution?: number
  createPlateData: (latLong: LatLong) => T
}

export class Tectonics<T = any> {
  plates: Map<string, Plate<T>> = new Map()
  indices: Map<string, string> = new Map()
  uuid = MathUtils.generateUUID()
  numberOfPlates: number
  origin: Vector3
  radius: number
  resolution: number
  constructor(props: TectonicsProps<T>) {
    this.numberOfPlates = props.numberOfPlates
    this.origin = props.origin
    this.radius = props.radius
    this.resolution = props.resolution || HEX_GRID_RESOLUTION

    this.generatePlates(props.createPlateData)
  }

  generatePlates(createPlateData: (latLong: LatLong) => T) {
    while (this.plates.size < this.numberOfPlates) {
      const latLong = LatLong.random()
      const plateData = createPlateData(latLong)
      const plate = new Plate<T>(latLong, plateData)
      this.plates.set(plate.uuid, plate)
    }
    this.indices = randomFloodFill(this, this.resolution)
  }

  getPlateFromVector3(vector: Vector3): Plate<T> | undefined {
    return Tectonics.getPlateFromVector3(this, vector)
  }

  static getPlateFromVector3<T>(
    tectonics: Tectonics<T>,
    vector: Vector3,
  ): Plate<T> | undefined {
    const latLong = LatLong.cartesianToLatLong(vector)
    return Tectonics.getPlateFromLatLong(tectonics, latLong)
  }

  getPlateFromLatLong(latLong: LatLong): Plate<T> | undefined {
    return Tectonics.getPlateFromLatLong(this, latLong)
  }

  static getPlateFromLatLong<T>(
    tectonics: Tectonics<T>,
    latLong: LatLong,
  ): Plate<T> | undefined {
    const h3Index = latLngToCell(latLong.lat, latLong.lon, tectonics.resolution)
    const plateUuid = tectonics.indices.get(h3Index)
    return tectonics.plates.get(plateUuid!)
  }
}
