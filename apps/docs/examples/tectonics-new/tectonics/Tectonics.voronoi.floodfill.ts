import { Noise, randomSpherePointVector3 } from "@hello-worlds/planets"
import { getNumCells, gridDisk, latLngToCell } from "h3-js"
import { Vector3 } from "three"
import Edge from "./Edge"
import { LatLong } from "./LatLong"
import Plate from "./Plate"
import { Tectonics } from "./Tectonics"

const _tempVec3 = new Vector3()

export function randomFloodFill(tectonics: Tectonics, gridResolution: number) {
  console.time("flood fill")

  const noise = new Noise({
    height: tectonics.radius / 1000,
    scale: tectonics.radius / 10,
  })

  const assignedIndices = new Map<
    string,
    { occupyingPlateIndex: string; index: string }
  >()
  const floodfillIndices = new Map<string, string>()
  const edgeMap = new Map<
    string,
    {
      plateA: string
      plateB: string
    }
  >()
  // We have already established our plate starting regions
  // We will treat these as "fronts" each of which will be a queue
  // that can gobble up it's neighboring regions

  const isCellAlreadyAssigned = (index: string) => {
    return assignedIndices.has(index)
  }

  const assignCellToPlate = (index: string, plate: Plate) => {
    plate.indices.add(index)
    assignedIndices.set(index, { occupyingPlateIndex: plate.uuid, index })
    floodfillIndices.set(index, plate.uuid)
  }

  const assignCellAsEdge = (cellIndex: string, plate: Plate) => {
    plate.externalEdges.add(cellIndex)
    const occupyingPlateUuid =
      assignedIndices.get(cellIndex)?.occupyingPlateIndex

    if (!occupyingPlateUuid) {
      return
    }

    const occupyingPlate = tectonics.plates.get(occupyingPlateUuid)
    plate.neighbors.add(occupyingPlateUuid)

    // Mark edges to be generated later
    edgeMap.set(Edge.makeEdgeKey(plate, occupyingPlate), {
      plateA: plate.uuid,
      plateB: occupyingPlateUuid,
    })

    if (occupyingPlate) {
      occupyingPlate.neighbors.add(plate.uuid)
      occupyingPlate.internalEdges.add(cellIndex)
    }
  }

  // while the fronts still have enqueued cells to process, we will continue
  while (assignedIndices.size < getNumCells(gridResolution)) {
    // Select random hex tile
    const randomPoint = randomSpherePointVector3(
      tectonics.origin,
      tectonics.radius,
      _tempVec3,
    )
    const latLong = LatLong.cartesianToLatLong(randomPoint)
    const cellIndex = latLngToCell(latLong.lat, latLong.lon, gridResolution)

    // make sure tile is not already assigned
    if (isCellAlreadyAssigned(cellIndex)) {
      continue
    }

    // get distance to closest plate root
    const { plate } = tectonics.closestPlateToLatLongPosition(latLong)
    // let distance = closestPlateDistance
    // TODO
    // // modify distance by noise
    // const distanceOffsetModifier = noise.getFromVector(randomPoint)
    // distance += distanceOffsetModifier

    // assign hex tile to plate
    assignCellToPlate(cellIndex, plate)

    // get neighbor hex tiles
    const neighborIndices = gridDisk(cellIndex, 1)

    // if neighbor tile is assigned to plate, add to edge list
    for (let i = 0; i < neighborIndices.length; i++) {
      const neighborIndex = neighborIndices[i]
      assignCellAsEdge(neighborIndex, plate)
    }
  }

  console.time("Generate Edges")
  // iterate through edgeMap and generate edges
  edgeMap.forEach(({ plateA, plateB }, key) => {
    const plateAInstance = tectonics.plates.get(plateA)
    const plateBInstance = tectonics.plates.get(plateB)
    if (plateAInstance && plateBInstance) {
      const edge = new Edge(plateAInstance, plateBInstance)
      tectonics.edges.set(edge.key, edge)
    }
  })
  console.timeEnd("Generate Edges")

  console.timeEnd("flood fill")
  return floodfillIndices
}
