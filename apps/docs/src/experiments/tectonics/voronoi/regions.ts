import { Vector3 } from "three"
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry"
import { polarToCartesian } from "./math"
import { GeoFeature, Region } from "./Voronoi"

export const convertFeaturesToRegions = (
  features: GeoFeature[],
  radius: number,
): Region[] => {
  const tempVector3 = new Vector3()
  const regions: Region[] = []
  for (let i = 0; i < features.length; i++) {
    const feature = features[i]

    const [lon, lat] = feature.properties.site
    const siteXYZ = polarToCartesian(lat, lon, radius)

    const polygonVerts = []
    // const polygonXYZ = [];
    const coords3d = feature.geometry.coordinates
      .map(coordsSegment =>
        coordsSegment.map(([lng, lat]) => polarToCartesian(lat, lng, radius)),
      )[0]
      .reduce((memo, { x, y, z }) => {
        memo.push(x, y, z)
        return memo
      }, [] as number[])

    const polygonPoints = []
    for (let i = 0; i < coords3d.length; i += 3) {
      const x = coords3d[i]
      const y = coords3d[i + 1]
      const z = coords3d[i + 2]
      polygonPoints.push(tempVector3.set(x, y, z).clone())
    }
    const hull = new ConvexGeometry(polygonPoints)

    const xyz = Array.from(hull.getAttribute("position").array)

    polygonVerts.push(...xyz)

    // for (let i = 0; i < xyz.length; i += 3) {
    //   const x = xyz[i];
    //   const y = xyz[i + 1];
    //   const z = xyz[i + 2];
    //   polygonXYZ.push(new Vector3(x, y, z));
    // }

    regions.push({
      ...feature,
      geometry: {
        ...feature.geometry,
        vertices: polygonVerts,
        edgeVertices: polygonVerts,
        polygonEdgePoints: polygonPoints,
        // verticesXYZ: polygonXYZ,
      },
      properties: {
        index: i,
        neighbors: feature.properties.neighbours,
        ...feature.properties,
        siteXYZ,
      },
    })
  }
  return regions
}
