import { Vector3 } from "three";
import { LongLat, polarToCartesian } from "./math";
import { neighbors, VoronoiSphere } from "./Voronoi";

export function findFromVoronoiSphere(voronoiSphere: VoronoiSphere) {
  return find(
    voronoiSphere.neighbors,
    voronoiSphere.points,
    voronoiSphere.radius
  );
}

export function find(neighbors: neighbors, points: LongLat[], radius: number) {
  return {
    findFromPolar(long: number, lat: number, next: number | null = 0) {
      let cell,
        dist,
        found = next;
      const xyz = polarToCartesian(lat, long, radius);
      while (next !== null) {
        cell = next;
        next = null;
        dist = xyz.distanceToSquared(
          polarToCartesian(points[cell][1], points[cell][0], radius)
        );
        for (let n = 0; n < neighbors[cell].length; n++) {
          const i = neighbors[cell][n];
          let ndist = xyz.distanceToSquared(
            polarToCartesian(points[i][1], points[i][0], radius)
          );
          if (ndist < dist) {
            dist = ndist;
            next = i;
            found = i;
            break;
          }
        }
      }

      return found;
    },
    findFromCartesian(xyz: Vector3, next: number | null = 0) {
      let cell,
        dist,
        found = next;
      while (next !== null) {
        cell = next;
        next = null;
        dist = xyz.distanceToSquared(
          polarToCartesian(points[cell][1], points[cell][0], radius)
        );
        for (let n = 0; n < neighbors[cell].length; n++) {
          const i = neighbors[cell][n];
          let ndist = xyz.distanceToSquared(
            polarToCartesian(points[i][1], points[i][0], radius)
          );
          if (ndist < dist) {
            dist = ndist;
            next = i;
            found = i;
            break;
          }
        }
      }

      return found;
    },
  };
}
