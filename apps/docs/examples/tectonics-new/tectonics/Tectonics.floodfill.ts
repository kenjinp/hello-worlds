import { choose, shuffle } from "@hello-worlds/core"
import { gridDisk, latLngToCell } from "h3-js"
import { Queue } from "./Queue"
import { Plate, Tectonics } from "./Tectonics"

export function randomFloodFill(tectonics: Tectonics, gridResolution: number) {
  const assignedIndices = new Map<string, string>()
  const { plates } = tectonics
  // We have already established our plate starting regions
  // We will treat these as "fronts" each of which will be a queue
  // that can gobble up it's neighboring regions

  const isCellAlreadyAssigned = (index: string) => {
    return assignedIndices.has(index)
  }

  const assignCellToPlate = (index: string, plate: Plate) => {
    plate.indices.push(index)
    assignedIndices.set(index, plate.uuid)
  }

  const fronts: Queue<{ plate: Plate; cellIndex: string }>[] = new Array(
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
    fronts[index].enqueue({
      plate,
      cellIndex: choose<string[]>(neighborIndices),
    })
    index++
  })

  console.time("flood fill")

  // while the fronts still have enqueued cells to process, we will continue
  while (fronts.reduce((memo, q) => memo || !q.isEmpty, false)) {
    // iterate through all the fronts randomly

    // shuffle our fronts
    shuffle<typeof fronts>(fronts)

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
        assignCellToPlate(cellIndex, plate)

        const neighborIndices = gridDisk(cellIndex, 1)
        // enqueue the first n indices
        for (let i = 0; i < neighborIndices.length; i++) {
          queue.enqueue({
            plate,
            cellIndex: neighborIndices[i],
          })
        }
      }
    }
  }

  console.timeEnd("flood fill")
  return assignedIndices
}
