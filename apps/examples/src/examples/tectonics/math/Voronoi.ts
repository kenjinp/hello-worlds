import { fibonacciSphere } from "@hello-worlds/planets"
import * as d3 from "d3-geo-voronoi"

export class VoronoiSphere {
  static generate() {
    const d = d3.geoDelaunay(
      fibonacciSphere(100, 0.5, Math.random).map(({ lat, lon }) => [lat, lon]),
    )
    console.log(d)
  }
}

// export interface GeoFeature {
//   type: "Feature"
//   geometry: {
//     coordinates: [LongLat[]]
//     type: "Polygon"
//   }
//   properties: {
//     neighbours: number[]
//     site: LongLat
//     sitecoodinates: LongLat
//   }
// }

// export interface Region {
//   type: "Feature"
//   geometry: {
//     coordinates: [LongLat[]]
//     vertices: number[]
//     edgeVertices: number[]
//     polygonEdgePoints: Vector3[]
//     // verticesXYZ: Vector3[];
//     type: "Polygon"
//   }
//   properties: {
//     index: number
//     neighbors: number[]
//     site: LongLat
//     siteXYZ: Vector3
//     // TODO
//     // Might need to calculate centroid for like labeling and such
//     // siteCentroidXYZ: Vector3;
//     sitecoodinates: LongLat
//   }
// }

// export type neighbors = number[][]

// // Chop up a sphere into Voronoi Regions
// // Offers a couple of helpful query methods
// export class VoronoiSphere {
//   regions: Region[]
//   neighbors: neighbors
//   constructor(
//     public readonly points: LongLat[],
//     public readonly radius: number,
//   ) {
//     this.regions = convertFeaturesToRegions(
//       d3.geoVoronoi(this.points).polygons(this.points).features as GeoFeature[],
//       radius,
//     )
//     this.neighbors = d3.geoDelaunay(this.points).neighbors
//   }

//   get find() {
//     const findIndex = find(this.neighbors, this.points, this.radius)
//     return {
//       fromPolar: findIndex.findFromPolar,
//       fromCartesian: findIndex.findFromCartesian,
//     }
//   }

//   static createFromFibonacciSphere(
//     numberOfPoints: number,
//     jitter: number,
//     radius: number,
//     random: () => number,
//   ) {
//     return new VoronoiSphere(
//       fibonacciSphere(numberOfPoints, jitter, random),
//       radius,
//     )
//   }
// }
