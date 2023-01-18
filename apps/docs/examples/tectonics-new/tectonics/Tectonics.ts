import { latLngToCell } from "h3-js"
import { EventDispatcher, MathUtils, Vector3 } from "three"
import Edge from "./Edge"
import { LatLong } from "./LatLong"
import Plate from "./Plate"
import { randomFloodFill } from "./Tectonics.floodfill"

export const HEX_GRID_RESOLUTION = 3

export interface TectonicsProps<T> {
  numberOfPlates: number
  origin: Vector3
  radius: number
  resolution?: number
  createPlateData: (latLong: LatLong) => T
}

export class TectonicsGeneratedEvent {
  type = "tectonics-generated"
  static type = "tectonics-generated"
  constructor() {}
}

export class Tectonics<T = any> extends EventDispatcher {
  plates: Map<string, Plate<T>> = new Map()
  indices: Map<string, string> = new Map()
  uuid = MathUtils.generateUUID()
  numberOfPlates: number
  origin: Vector3
  radius: number
  resolution: number
  edges = new Map<string, Edge>()

  constructor(props: TectonicsProps<T>) {
    super()
    this.numberOfPlates = props.numberOfPlates
    this.origin = props.origin
    this.radius = props.radius
    this.resolution = props.resolution || HEX_GRID_RESOLUTION

    console.time("Generating Plates")
    this.generatePlates(props.createPlateData)
    console.timeEnd("Generating Plates")
    this.dispatchEvent(new TectonicsGeneratedEvent())

    this.plates.forEach(plate => {
      Plate.generatePolygon(plate)
    })

    console.time("Generate Region Elevations")
    //
    console.timeEnd("Generate Region Elevations")
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
