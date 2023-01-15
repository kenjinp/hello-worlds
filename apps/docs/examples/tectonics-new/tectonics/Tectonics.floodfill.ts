import { shuffle } from "@hello-worlds/core"
import { gridDisk, latLngToCell } from "h3-js"
import Edge from "./Edge"
import Plate from "./Plate"
import { Queue } from "./Queue"
import { Tectonics } from "./Tectonics"

export function randomFloodFill(tectonics: Tectonics, gridResolution: number) {
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
  const { plates } = tectonics
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

  let fronts: Queue<{ plate: Plate; cellIndex: string }>[] = new Array(
    plates.size,
  )
    .fill(0)
    .map(_ => new Queue<{ plate: Plate; cellIndex: string }>())

  let index = 0
  plates.forEach((plate, key) => {
    // assign the starting cell to our index list
    const originCell = latLngToCell(
      plate.origin.lat,
      plate.origin.lon,
      gridResolution,
    )
    assignCellToPlate(originCell, plate)
    // we will prime the fronts by the starting cell
    const neighborIndices = gridDisk(originCell, 1)
    for (let i = 0; i < neighborIndices.length; i++) {
      fronts[index].enqueue({
        plate,
        cellIndex: neighborIndices[i],
      })
    }
    index++
  })

  console.time("flood fill")

  // while the fronts still have enqueued cells to process, we will continue
  while (fronts.reduce((memo, q) => memo || !q.isEmpty, false)) {
    // iterate through all the fronts randomly

    // shuffle our fronts
    fronts = shuffle<typeof fronts>(fronts)

    // deal our fronts
    for (let i = 0; i < fronts.length; i++) {
      const queue = fronts[i]
      if (queue.isEmpty) {
        continue
      }

      const { cellIndex, plate } = queue.dequeue()

      if (!cellIndex) {
        continue
      }

      if (!isCellAlreadyAssigned(cellIndex)) {
        // Cell is up for grabs, give it to the plate that belongs to this front
        assignCellToPlate(cellIndex, plate)

        const neighborIndices = gridDisk(cellIndex, 1)
        for (let i = 0; i < neighborIndices.length; i++) {
          queue.enqueue({
            plate,
            cellIndex: neighborIndices[i],
          })
        }
      } else {
        // Cell is already assigned, which means we are touching an edge!
        // We will add this cell to the plate's edge list
        // we might want to make a set or map from this instead
        if (!plate.indices.has(cellIndex)) {
          plate.externalEdges.add(cellIndex)
          const occupyingPlateUuid =
            assignedIndices.get(cellIndex)?.occupyingPlateIndex

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
      }
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
