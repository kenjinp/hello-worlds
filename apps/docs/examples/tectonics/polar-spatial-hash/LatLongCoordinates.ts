// Define a class for storing latitude and longitude coordinates
export class LatLonCoordinates {
  constructor(public lat: number, public lon: number) {}
  distanceTo(other: LatLonCoordinates): number {
    return Math.sqrt((this.lat - other.lat) ** 2 + (this.lon - other.lon) ** 2)
  }
}
