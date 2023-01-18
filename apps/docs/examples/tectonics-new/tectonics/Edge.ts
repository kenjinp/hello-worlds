import { cellToBoundary, gridDisk } from "h3-js"
import BoundaryPoint from "./Boundary"
import { LatLong } from "./LatLong"
import Plate from "./Plate"

export default class Edge {
  key: string
  points: Map<string, LatLong> = new Map()
  indices: Set<string> = new Set()
  boundaryPoints: Map<string, BoundaryPoint> = new Map()
  constructor(public readonly plateA: Plate, public readonly plateB: Plate) {
    // Get the intersecting vertices from the plate boundaries
    // Find the hex tiles that belong to both plates
    this.plateA.internalEdges.forEach(hexIndex => {
      if (this.plateB.externalEdges.has(hexIndex)) {
        this.indices.add(hexIndex)
        // get vertices of this hex tile
        const hexBoundaryVertices = cellToBoundary(hexIndex)

        // get neighbors of this hex tile
        const neighbors = gridDisk(hexIndex, 1)

        // filter neighbors by the other plate's internal edges
        const matchingNeighbors = []
        for (const neighbor of neighbors) {
          if (plateB.internalEdges.has(neighbor)) {
            matchingNeighbors.push(neighbor)
          }
        }

        // get the matching neighbor hexes and their vertices from the other plate
        const matchingNeighborVertices = []

        for (const neighbor of matchingNeighbors) {
          matchingNeighborVertices.push(...cellToBoundary(neighbor))
        }

        for (const latLong of hexBoundaryVertices) {
          // if the vertex is not in the other plate, add it to the edge
          const matches = matchingNeighborVertices.find(
            ll =>
              LatLong.hash(ll[0], ll[1]) ===
              LatLong.hash(latLong[0], latLong[1]),
          )
          if (matches) {
            const ll = new LatLong(latLong[0], latLong[1])
            this.points.set(ll.hash, ll)
          }
        }
      }
    })

    this.key = Edge.makeEdgeKey(this.plateA, this.plateB)

    this.calculateEdgeForces()
  }

  calculateEdgeForces() {
    for (const [key, point] of this.points) {
      this.boundaryPoints.set(point.hash, new BoundaryPoint(this, point))
    }
  }

  static makeEdgeKey(plateA: Plate, plateB: Plate) {
    return [plateA.uuid, plateB.uuid].sort().join("::")
  }
}
