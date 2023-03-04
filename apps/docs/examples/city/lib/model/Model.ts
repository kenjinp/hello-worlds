import { Vector3 } from "three"
import { sign } from "../math/helpers"
import { Random } from "../math/Random"
import { Voronoi } from "../math/Voronoi"
import { Patch } from "./Patch"

export class CityModel {
  random: Random
  plazaNeeded: boolean
  citadelNeeded: boolean
  wallsNeeded: boolean
  streets: []
  roads: []
  voronoi: Voronoi
  patches: Patch[] = []
  inner: Patch[] = []
  citadel?: Patch
  plaza?: Patch
  center?: Vector3

  constructor(
    private nPatches = 15,
    private offset = new Vector3(),
    public seed?: string,
  ) {
    this.random = new Random(seed)

    this.plazaNeeded = this.random.bool()
    this.citadelNeeded = this.random.bool()
    this.wallsNeeded = this.random.bool()
    this.build()
    // let success = false;
    // do try {
    // 	this.build();
    // 	success = true;
    // } catch (error) {
    // 	console.error(error)
    // 	success = false
    // } while (!success);
  }

  build() {
    console.time("buildPatches")
    console.log("Building patches...")
    this.buildPatches()
    console.timeEnd("buildPatches")

    console.time("optimizeJunctions")
    this.optimizeJunctions()
    console.timeEnd("optimizeJunctions")

    console.time("buildWalls")
    this.buildWalls()
    console.timeEnd("buildWalls")

    // buildStreets();
    // createWards();
    // buildGeometry();
  }

  buildPatches() {
    const sa = this.random.float() * 2 * Math.PI
    const points = new Array(this.nPatches * 8).fill(0).map((_, i) => {
      let a = sa + Math.sqrt(i) * 5
      let r = i == 0 ? 0 : 10 + i * (2 + this.random.float())
      const x = Math.cos(a) * r + this.offset.x
      const y = Math.sin(a) * r + this.offset.y
      return new Vector3(x, y, 0)
    })
    let voronoi = Voronoi.build(points)
    this.voronoi = voronoi
    console.log({ voronoi })

    // Relaxing central wards
    console.time("relaxing central wards")
    for (let i = 0; i < 3; i++) {
      const toRelax = [
        voronoi.points[0],
        voronoi.points[1],
        voronoi.points[2],
        voronoi.points[3],
      ]
      toRelax.push(voronoi.points[this.nPatches])
      voronoi = Voronoi.relax(voronoi, toRelax)
    }
    console.timeEnd("relaxing central wards")

    console.time("generating patches")

    voronoi.points.sort(function (p1, p2) {
      return sign(p1.length() - p2.length())
    })
    let regions = voronoi.partioning()
    console.log({ regions })

    this.patches = []
    this.inner = []

    let count = 0
    for (let r of regions) {
      let patch = Patch.fromRegion(r)
      this.patches.push(patch)

      if (count == 0) {
        this.center = patch.shape.min
        if (this.plazaNeeded) {
          this.plaza = patch
        }
      } else if (count == this.nPatches && this.citadelNeeded) {
        this.citadel = patch
        this.citadel.withinCity = true
      }

      if (count < this.nPatches) {
        patch.withinCity = true
        patch.withinWalls = this.wallsNeeded
        this.inner.push(patch)
      }

      count++
    }

    console.log({ patches: this.patches })

    console.timeEnd("generating patches")
  }

  private buildWalls() {}

  private optimizeJunctions() {
    const patchesToOptimize: Array<Patch> =
      this.citadel == null ? this.inner : this.inner.concat([this.citadel])

    const wardsToClean: Array<Patch> = []
    for (let w of patchesToOptimize) {
      let index = 0
      while (index < w.shape.length) {
        const v0 = w.shape[index]
        const v1 = w.shape[(index + 1) % w.shape.length]

        if (v0 != v1 && v0.distanceTo(v1) < 8) {
          for (let w1 of this.patchByVertex(v1)) {
            if (w1 != w) {
              w1.shape[w1.shape.vertices.indexOf(v1)] = v0
              wardsToClean.push(w1)
            }
          }

          v0.addEq(v1)
          v0.scaleEq(0.5)

          w.shape.remove(v1)
        }
        index++
      }
    }

    // Removing duplicate vertices
    for (let w of wardsToClean) {
      for (let i = 0; i < w.shape.length; i++) {
        let v = w.shape[i]
        let dupIdx
        while ((dupIdx = w.shape.vertices.indexOf(v, i + 1)) != -1) {
          w.shape.vertices.splice(dupIdx, 1)
        }
      }
    }
  }

  public patchByVertex(v: Vector3) {
    return this.patches.filter(patch => patch.shape.contains(v))
  }
}
