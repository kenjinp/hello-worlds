import { Vector3 } from "three"
import { bisect } from "../math/Cutter"
import { distance2line, Polygon, rotate90, scalar } from "../math/Polgygon"
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
      if (!!this.model.wall && this.model.wall.bordersBy(this.patch, v0, v1)) {
        // Not too close to the wall
        insetDist.push(Ward.MAIN_STREET / 2)
      } else {
        let isOnStreet =
          isInnerPatch &&
          !!this.model.plaza &&
          this.model.plaza.shape.hasEdge(v1, v0)
        if (!isOnStreet) {
          for (let street of this.model.arteries) {
            if (street.contains(v0) && street.contains(v1)) {
              isOnStreet = true
              break
            }
          }
        }
        insetDist.push(
          (isOnStreet
            ? Ward.MAIN_STREET
            : isInnerPatch
            ? Ward.REGULAR_STREET
            : Ward.ALLEY) / 2,
        )
      }
    })

    return this.patch.shape.isConvex()
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
      for (let street of this.model.arteries) {
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

  private static findLongestEdge(poly: Polygon) {
    return poly.minPredicate(v => -poly.vector(v).length())
  }

  public static createAlleys(
    p: Polygon,
    minSq: number,
    gridChaos: number,
    sizeChaos: number,
    emptyProb = 0.04,
    split = true,
  ): Array<Polygon> {
    // Looking for the longest edge to cut it
    let v: Vector3 = null
    let length = -1.0
    p.forEdge((p0, p1) => {
      let len = p0.distanceTo(p1)
      if (len > length) {
        length = len
        v = p0
      }
    })

    let spread = 0.8 * gridChaos
    let ratio = (1 - spread) / 2 + random.float() * spread

    // Trying to keep buildings rectangular even in chaotic wards
    let angleSpread =
      (Math.PI / 6) * gridChaos * (p.square < minSq * 4 ? 0.0 : 1)
    let b = (random.float() - 0.5) * angleSpread

    let halves = bisect(p, v, ratio, b, split ? Ward.ALLEY : 0.0)

    let buildings = []
    for (let half of halves) {
      if (
        half.square <
        minSq * Math.pow(2, 4 * sizeChaos * (random.float() - 0.5))
      ) {
        if (!random.bool(emptyProb)) buildings.push(half)
      } else {
        buildings = buildings.concat(
          Ward.createAlleys(
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

  public static createOrthoBuilding(
    poly: Polygon,
    minBlockSq: number,
    fill: number,
  ) {
    function slice(poly: Polygon, c1: Vector3, c2: Vector3) {
      let v0 = this.findLongestEdge(poly)
      let v1 = poly.next(v0)
      let v = v1.sub(v0)

      let ratio = 0.4 + this.model.random.float() * 0.2
      let p1 = v0.lerp(v1, ratio)

      let c: Vector3 =
        Math.abs(scalar(v.x, v.y, v.z, c1.x, c1.y, c1.z)) <
        Math.abs(scalar(v.x, v.y, v.z, c2.x, c2.y, c2.z))
          ? c1
          : c2

      let halves = poly.cut(p1, p1.add(c))
      let buildings = []
      for (let half of halves) {
        if (
          half.square <
          minBlockSq * Math.pow(2, this.model.random.normal() * 2 - 1)
        ) {
          if (this.model.random.bool(fill)) buildings.push(half)
        } else {
          buildings = buildings.concat(slice(half, c1, c2))
        }
      }
      return buildings
    }

    if (poly.square < minBlockSq) {
      return [poly]
    } else {
      const c1 = poly.vector(this.findLongestEdge(poly))
      const c2 = rotate90(c1)
      while (true) {
        const blocks = slice(poly, c1, c2)
        if (blocks.length > 0) {
          return blocks
        }
      }
    }
  }
}
