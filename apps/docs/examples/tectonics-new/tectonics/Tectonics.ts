import { cellsToMultiPolygon, latLngToCell } from "h3-js"
import { Color, MathUtils, Vector3 } from "three"
import { LatLong } from "./LatLong"
import { randomFloodFill } from "./Tectonics.floodfill"

export const HEX_GRID_RESOLUTION = 3

export class Plate {
  name: string
  indices: string[] = []
  uuid = MathUtils.generateUUID()
  color = new Color(Math.random() * 0xffffff)
  constructor(public readonly origin: LatLong) {}
  polygon() {
    return cellsToMultiPolygon(this.indices)
  }
  static polygon(plate: Plate) {
    return cellsToMultiPolygon(plate.indices)
  }
}

export class Tectonics {
  plates: Map<string, Plate> = new Map()
  indices: Map<string, string> = new Map()
  uuid = MathUtils.generateUUID()
  constructor(
    public readonly numberOfPlates: number,
    public readonly origin: Vector3,
    public readonly radius: number,
    public readonly resolution = HEX_GRID_RESOLUTION,
  ) {
    this.generatePlates()
  }

  generatePlates() {
    while (this.plates.size < this.numberOfPlates) {
      const plate = new Plate(LatLong.random())
      this.plates.set(plate.uuid, plate)
    }
    this.indices = randomFloodFill(this, this.resolution)
  }

  getPlateFromVector3(vector: Vector3): Plate | undefined {
    return Tectonics.getPlateFromVector3(this, vector)
  }

  static getPlateFromVector3(
    tectonics: Tectonics,
    vector: Vector3,
  ): Plate | undefined {
    const latLong = LatLong.cartesianToLatLong(vector)
    return Tectonics.getPlateFromLatLong(tectonics, latLong)
  }

  getPlateFromLatLong(latLong: LatLong): Plate | undefined {
    return Tectonics.getPlateFromLatLong(this, latLong)
  }

  static getPlateFromLatLong(
    tectonics: Tectonics,
    latLong: LatLong,
  ): Plate | undefined {
    const h3Index = latLngToCell(latLong.lat, latLong.lon, tectonics.resolution)
    const plateUuid = tectonics.indices.get(h3Index)
    return tectonics.plates.get(plateUuid!)
  }
}
