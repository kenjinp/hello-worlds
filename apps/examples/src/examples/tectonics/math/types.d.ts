import { LongLat } from "./math"
import { GeoFeature } from "./Voronoi"

export type LongLat = [number, number]

declare module "d3-geo-voronoi" {
  function geoVoronoi(longLat: LongLat[]): {
    polygons: (longLat: LongLat) => GeoFeature[]
  }
  function geoDelaunay(longLath: LongLat[]): neighbors
  export = geoVoronoi
  export = geoDelaunay
}
