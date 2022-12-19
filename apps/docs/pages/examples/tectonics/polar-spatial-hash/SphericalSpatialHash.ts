import { LatLonCoordinates } from "./LatLongCoordinates"
import { SphericalBoundingBox } from "./SphericalBoundingBox"
import { SphericalCell } from "./SphericalCell"

export class SphericalSpatialHash<T> {
  readonly cells: SphericalCell<T>[] = []

  constructor(
    public readonly longitudeResolution: number,
    public readonly latitudeResolution: number,
    public readonly radius: number,
  ) {
    for (let lat = -90; lat < 90; lat += 180 / latitudeResolution) {
      for (let lon = -180; lon < 180; lon += 360 / longitudeResolution) {
        this.cells.push(
          new SphericalCell<T>(
            new SphericalBoundingBox(
              new LatLonCoordinates(lat, lon),
              new LatLonCoordinates(
                lat + latitudeResolution,
                lon + longitudeResolution,
              ),
            ),
          ),
        )
      }
    }
  }

  convertSearchRadiusToLatitude(searchRadius: number) {
    return (searchRadius / this.radius) * (180 / Math.PI)
  }
  convertSearchRadiusToLongitude(
    coordinates: LatLonCoordinates,
    searchRadius: number,
  ) {
    return (
      ((searchRadius / this.radius) * (180 / Math.PI)) /
      Math.cos((coordinates.lat * Math.PI) / 180)
    )
  }

  add(coordinates: LatLonCoordinates, entity: T) {
    for (const cell of this.cells) {
      if (cell.intersects(new SphericalBoundingBox(coordinates, coordinates))) {
        cell.add(entity)
      }
    }
    return this
  }

  addAllByRadius(
    coordinates: LatLonCoordinates,
    radius: number,
    entities: T[],
  ) {
    const cells = this.queryCells(coordinates, radius)
    console.log("addCells", cells)
    for (const cell of cells) {
      cell.entities.push(...entities)
    }
    return this
  }

  getIndexForCoordinates(coordinates: LatLonCoordinates) {
    const latIndex = Math.floor(
      (coordinates.lat + 90) / this.latitudeResolution,
    )
    const lonIndex = Math.floor(
      (coordinates.lon + 180) / this.longitudeResolution,
    )
    return latIndex * (180 / this.longitudeResolution) + lonIndex
  }

  queryCells(coordinates: LatLonCoordinates, searchRadius: number) {
    const adjustedLat = this.convertSearchRadiusToLatitude(searchRadius)
    const adjustedLon = this.convertSearchRadiusToLongitude(
      coordinates,
      searchRadius,
    )

    const results: SphericalCell<T>[] = []
    const boundingBox = new SphericalBoundingBox(
      new LatLonCoordinates(
        coordinates.lat - adjustedLat,
        coordinates.lon - adjustedLon,
      ),
      new LatLonCoordinates(
        coordinates.lat + adjustedLat,
        coordinates.lon + adjustedLon,
      ),
    )
    for (const cell of this.cells) {
      if (cell.intersects(boundingBox) && !cell.empty()) {
        results.push(cell)

        // for (const entity of cell.entities) {
        //   if (
        //     coordinates.distanceTo(entity.coordinates) <= radius &&
        //     !results.includes(entity)
        //   ) {
        //     results.push(entity)
        //   }
        // }
      }
    }
    return results
  }
}
