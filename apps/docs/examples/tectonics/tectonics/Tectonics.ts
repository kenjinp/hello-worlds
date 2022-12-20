import { Color, MathUtils, Vector3 } from "three"
import { findFromVoronoiSphere } from "../voronoi/find"
import { Region, VoronoiSphere } from "../voronoi/Voronoi"
import { Edge, findEdges } from "./Edge"
import { Plate } from "./Plate"
import { PlateRegion } from "./PlateRegion"
import { randomFloodFill } from "./randomFloodFill"

export function choosePlateStartPoints(
  regions: Region[],
  numberOfPlates: number,
  randomMinMaxInteger: (min: number, max: number) => number,
) {
  const chosenRegions = new Set<number>()
  while (chosenRegions.size < numberOfPlates) {
    chosenRegions.add(randomMinMaxInteger(0, regions.length))
  }
  return chosenRegions
}

const oceanicRate = 0.7

export class Tectonics {
  plates: Map<number, Plate> = new Map()
  edges: Map<number, Edge> = new Map()
  uuid = MathUtils.generateUUID()
  // cellSpacePartition: CellSpacePartitioning
  constructor(
    public readonly voronoiSphere: VoronoiSphere,
    public readonly numberOfPlates: number,
  ) {
    let i = 0
    const diameter = voronoiSphere.radius * 2
    const partitions = 50
    // this.cellSpacePartition = new CellSpacePartitioning(
    //   diameter,
    //   diameter,
    //   diameter,
    //   partitions,
    //   partitions,
    //   partitions,
    // )
    choosePlateStartPoints(
      voronoiSphere.regions,
      numberOfPlates,
      MathUtils.randInt,
    ).forEach(val => {
      const oceanic = MathUtils.randFloat(0, 1) < oceanicRate
      this.plates.set(
        i,
        new Plate({
          index: i,
          color: new Color(Math.random() * 0xffffff),
          name: `plate-${i}`,
          startRegion: voronoiSphere.regions[val],
          driftAxis: new Vector3().randomDirection(),
          driftRate: MathUtils.randFloat(-Math.PI / 30, Math.PI / 30),
          spinRate: MathUtils.randFloat(-Math.PI / 30, Math.PI / 30),
          elevation: oceanic
            ? MathUtils.randFloat(-0.8, -0.3)
            : MathUtils.randFloat(0.1, 0.5),
          oceanic,
        }),
      )
      i++
    })

    randomFloodFill(this, MathUtils.randInt, MathUtils.randFloat)

    findEdges(this)

    const edgeSize = this.edges.size
    const totalNeighbors = Array.from(this.plates.values()).reduce(
      (memo, plate) => {
        memo += plate.neighbors.size
        return memo
      },
      0,
    )

    console.assert(
      edgeSize === totalNeighbors / 2,
      "Edge keys collision detected",
    )
  }

  static findPlateFromCartesian(
    tectonics: Tectonics,
    vector: Vector3,
    next?: number,
  ): PlateRegion | null {
    const { findFromCartesian } = findFromVoronoiSphere(tectonics.voronoiSphere)

    const regionIndex = findFromCartesian(vector, next)
    if (Number.isFinite(regionIndex)) {
      next = regionIndex
      let plate: Plate | null = null
      for (let p = 0; p < tectonics.plates.size; p++) {
        const entry = tectonics.plates.get(p)
        if (entry && entry.regions.has(regionIndex!)) {
          plate = entry
          break
        }
      }
      if (plate as Plate | null) {
        const region = plate?.regions.get(regionIndex!)
        return region || null
      }
    }
    return null
  }
}
