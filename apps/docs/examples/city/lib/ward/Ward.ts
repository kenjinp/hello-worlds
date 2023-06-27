import { Vector3 } from "three"
import { bisect } from "../math/Cutter"
import { distance2line, perpendicular, Polygon, scalar } from "../math/Polygon"
import { Random } from "../math/Random"
import { CityModel } from "../model/Model"
import { Patch } from "../model/Patch"

const random = new Random()

export class Ward {
  public static MAIN_STREET = 2.0
  public static REGULAR_STREET = 1.0
  public static ALLEY = 0.6

  public geometry: Array<Polygon> = []

  constructor(public model: CityModel, public patch: Patch) {
    this.model = model
    this.patch = patch
  }

  public createGeometry() {
    this.geometry = []
  }

  public getLabel() {
    return "Ward"
  }

  public getCityBlock(): Polygon {
    const insetDist: Array<number> = []

    const isInnerPatch = !this.model.wall || this.patch.withinWalls
    this.patch.shape.forEdge((v0, v1) => {
      // insetDist.push(Ward.MAIN_STREET / 2)
      const bordersWall =
        !!this.model.wall && this.model.wall.bordersBy(this.patch, v0, v1)
      if (bordersWall) {
        // Not too close to the wall
        insetDist.push(Ward.MAIN_STREET / 2)
      } else {
        let isOnStreet =
          isInnerPatch &&
          !!this.model.plaza &&
          this.model.plaza.shape.hasEdge(v1, v0)
        if (!isOnStreet) {
          for (let street of this.model.streets) {
            if (street.contains(v0) && street.contains(v1)) {
              isOnStreet = true
              break
            }
          }
        }
        const notOnStreetInsetSize = isInnerPatch
          ? Ward.REGULAR_STREET
          : Ward.ALLEY
        insetDist.push(
          (isOnStreet ? Ward.MAIN_STREET : notOnStreetInsetSize) / 2,
        )
      }
    })

    const isConvex = this.patch.shape.copy().isConvex()

    return isConvex
      ? this.patch.shape.shrink(insetDist)
      : this.patch.shape.insetAllEdgesByDistances(insetDist)
  }

  public filterOutskirts() {
    let populatedEdges = []

    const addEdge = (v1: Vector3, v2: Vector3, factor = 1.0) => {
      let dx = v2.x - v1.x
      let dy = v2.y - v1.y
      let distances = new Map<Vector3, number>()
      let d = this.patch.shape.maxPredicate(v => {
        const val =
          (v !== v1 && v !== v2
            ? distance2line(v1.x, v1.y, dx, dy, v.x, v.y)
            : 0) * factor
        distances.set(v, val)
        return val
      })
      populatedEdges.push({
        x: v1.x,
        y: v1.y,
        dx: dx,
        dy: dy,
        d: distances.get(d),
      })
    }

    this.patch.shape.forEdge((v1, v2) => {
      let isOnRoad = false
      for (let street of this.model.roads) {
        if (street.contains(v1) && street.contains(v2)) {
          isOnRoad = true
          break
        }
      }

      if (isOnRoad) {
        addEdge(v1, v2, 1)
      } else {
        let n = this.model.getNeighbor(this.patch, v1)
        if (!!n && n.withinCity) {
          addEdge(v1, v2, this.model.isEnclosed(n) ? 1 : 0.4)
        }
      }
    })

    // For every vertex: if this belongs only
    // to patches within city, then 1, otherwise 0

    const density = this.patch.shape.vertices.map(v => {
      if (this.model.gates.includes(v)) {
        return 1
      } else {
        return this.model.patchByVertex(v).every(p => p.withinCity)
          ? 2 * this.model.random.float()
          : 0
      }
    })

    this.geometry = this.geometry.filter((building: Polygon) => {
      let minDist = 1.0
      for (let edge of populatedEdges) {
        for (let v of building.vertices) {
          // Distance from the center of the building to the edge
          let d = distance2line(edge.x, edge.y, edge.dx, edge.dy, v.x, v.y)
          let dist = d / edge.d
          if (dist < minDist) {
            minDist = dist
          }
        }
      }

      let c = building.center
      let i = this.patch.shape.interpolate(c)
      let p = 0.0
      for (let j = 0; j < i.length; j++) {
        p += density[j] * i[j]
      }
      minDist /= p

      return this.model.random.fuzzy(1) > minDist
    })
  }

  public static createAlleys(
    polygon: Polygon,
    minSq: number,
    gridChaos: number,
    sizeChaos: number,
    emptyProb = 0.04,
    split = true,
  ): Array<Polygon> {
    const maxIterations = 500

    let iterations = 0
    const createAlleysHelper = (
      polygon: Polygon,
      minSq: number,
      gridChaos: number,
      sizeChaos: number,
      emptyProb = 0.04,
      split = true,
    ) => {
      if (iterations++ > maxIterations) {
        return []
      }

      // Looking for the longest edge to cut it
      const longestEdgeVector = polygon.minPredicate(
        v => -polygon.vector(v).length(),
      )

      const spread = 0.8 * gridChaos
      const ratio = (1 - spread) / 2 + random.float() * spread

      // Trying to keep buildings rectangular even in chaotic wards
      const angleSpread =
        (Math.PI / 6) * gridChaos * (polygon.square < minSq * 4 ? 0.0 : 1)
      const b = (random.float() - 0.5) * angleSpread

      const halves = bisect(
        polygon,
        longestEdgeVector,
        ratio,
        b,
        split ? Ward.ALLEY : 0.0,
      )

      let buildings = []
      for (let half of halves) {
        if (
          half.square <
          minSq * Math.pow(2, 4 * sizeChaos * (random.float() - 0.5))
        ) {
          if (!random.bool(emptyProb)) {
            buildings.push(half)
          }
        } else {
          buildings = buildings.concat(
            createAlleysHelper(
              half,
              minSq,
              gridChaos,
              sizeChaos,
              emptyProb,
              half.square > minSq / (random.float() * random.float()),
            ),
          )
        }
      }

      return buildings
    }

    return createAlleysHelper(
      polygon,
      minSq,
      gridChaos,
      sizeChaos,
      emptyProb,
      split,
    )
  }

  public createOrthoBuilding(poly: Polygon, minBlockSq: number, fill: number) {
    let maxSlice = 3000
    let that = this
    function slice(poly: Polygon, c1: Vector3, c2: Vector3) {
      if (maxSlice-- < 0) {
        console.warn("max slice", poly, that)
        return [poly]
      }
      let v0 = poly.getLongestEdge()
      let v1 = poly.next(v0)
      let v = v1.clone().sub(v0)

      let ratio = 0.4 + random.float() * 0.2
      let p1 = v0.clone().lerp(v1, ratio)

      let c: Vector3 =
        Math.abs(scalar(v.x, v.y, v.z, c1.x, c1.y, c1.z)) <
        Math.abs(scalar(v.x, v.y, v.z, c2.x, c2.y, c2.z))
          ? c1
          : c2

      let halves = poly.cut(p1, p1.add(c))
      let buildings: Polygon[] = []
      for (let half of halves) {
        if (half.square < minBlockSq * Math.pow(2, random.normal() * 2 - 1)) {
          if (random.bool(fill)) buildings.push(half)
        } else {
          buildings = buildings.concat(slice(half, c1, c2))
        }
      }
      return buildings
    }

    if (poly.square < minBlockSq) {
      return [poly]
    } else {
      const c1 = poly.vector(poly.getLongestEdge())
      const c2 = perpendicular(c1)
      let blocks: Polygon[] = []
      let maxIterations = 30
      while (!blocks.length) {
        if (maxIterations-- < 0) {
          console.warn("max iterations reached")
          return [poly]
        }
        blocks = slice(poly.clone(), c1, c2)
      }
      return blocks
    }
  }
}
