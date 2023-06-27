import { Vector3 } from "three"
import { Region } from "./Region"
import { Triangle } from "./Triangle"

const _tempVec3 = new Vector3()

// export function hashTriangle( t: Triangle ): string {
//   return [t.a.toArray().join('-'), t.b.toArray().join('-'), t.c.toArray().join('-')].sort().join(',');
// }

export class Voronoi {
  public triangles: Triangle[] = []
  // public regions: Map<Vector3, Region> = new Map<Vector3, Region>();
  private _regionsDirty: boolean = false
  private _regions: Map<Vector3, Region> = new Map<Vector3, Region>()
  public points: Vector3[] = []
  public frame: Vector3[] = []

  constructor(
    public minX: number,
    public minY: number,
    public maxX: number,
    public maxY: number,
  ) {
    // Y+ is up
    const c1 = new Vector3(minX, minY, 0)
    const c2 = new Vector3(minX, maxY, 0)
    const c3 = new Vector3(maxX, minY, 0)
    const c4 = new Vector3(maxX, maxY, 0)
    this.frame = [c1, c2, c3, c4]
    this.points = [c1, c2, c3, c4]
    this.triangles.push(new Triangle(c1, c2, c3))
    this.triangles.push(new Triangle(c2, c3, c4))

    // Maybe we shouldn't do it beause these temporary
    // regions will be discarded anyway
    this.points.forEach(p => {})
    this._regionsDirty = false
  }

  /**
   * Adds a point to the list and updates the list of triangles
   * @param p a point to add
   **/
  public addPoint(p: Vector3) {
    let toSplit: Array<Triangle> = []
    for (let tr of this.triangles) {
      if (p.distanceTo(tr.c) < tr.r) {
        toSplit.push(tr)
      }
    }

    if (toSplit.length > 0) {
      this.points.push(p)

      let a: Array<Vector3> = []
      let b: Array<Vector3> = []

      for (let t1 of toSplit) {
        let e1 = true
        let e2 = true
        let e3 = true
        for (let t2 of toSplit) {
          if (t2 !== t1) {
            // If triangles have a common edge, it goes in opposite directions
            if (e1 && t2.hasEdge(t1.p2, t1.p1)) e1 = false
            if (e2 && t2.hasEdge(t1.p3, t1.p2)) e2 = false
            if (e3 && t2.hasEdge(t1.p1, t1.p3)) e3 = false
            if (!(e1 || e2 || e3)) break
          }
        }
        if (e1) {
          a.push(t1.p1)
          b.push(t1.p2)
        }
        if (e2) {
          a.push(t1.p2)
          b.push(t1.p3)
        }
        if (e3) {
          a.push(t1.p3)
          b.push(t1.p1)
        }
      }

      let index = 0
      let tries = 0
      do {
        this.triangles.push(new Triangle(p, a[index], b[index]))
        index = a.indexOf(b[index])
        tries++
        if (tries > 1000) {
          throw new Error("Infinite loop")
        }
      } while (index != 0)

      for (let tr of toSplit) {
        this.triangles = this.triangles.filter(t => {
          return t !== tr
        })
      }

      this._regionsDirty = true
    }
  }

  private buildRegion(p: Vector3): Region {
    var r = new Region(p)
    for (let tr of this.triangles)
      if (tr.p1 == p || tr.p2 == p || tr.p3 == p) r.vertices.push(tr)

    return r.sortVertices()
  }

  public get regions(): Map<Vector3, Region> {
    if (this._regionsDirty) {
      this._regions = new Map()
      this._regionsDirty = false
      for (let p of this.points) this._regions.set(p, this.buildRegion(p))
    }
    return this._regions
  }

  /**
   * Checks if neither of a triangle's vertices is a frame point
   **/
  private isReal(tr: Triangle): boolean {
    return !(
      this.frame.includes(tr.p1) ||
      this.frame.includes(tr.p2) ||
      this.frame.includes(tr.p3)
    )
  }

  /**
   * Returns triangles which do not contain "frame" points as their vertices
   * @return List of triangles
   **/
  public triangulation(): Array<Triangle> {
    return this.triangles.filter(this.isReal.bind(this))
  }

  public partioning(): Array<Region> {
    // Iterating over points, not regions, to use points ordering
    const result: Array<Region> = []
    for (let p of this.points) {
      const r = this.regions.get(p)
      if (!r) continue
      let isReal = true
      for (let v of r.vertices)
        if (!this.isReal(v)) {
          isReal = false
          break
        }

      if (isReal) result.push(r)
    }
    return result
  }

  public static build(vertices: Vector3[]): Voronoi {
    let minx = Infinity
    let miny = Infinity
    let maxx = -Infinity
    let maxy = -Infinity
    for (let v of vertices) {
      minx = Math.min(minx, v.x)
      miny = Math.min(miny, v.y)
      maxx = Math.max(maxx, v.x)
      maxy = Math.max(maxy, v.y)
    }
    let dx = (maxx - minx) * 0.5
    let dy = (maxy - miny) * 0.5

    let voronoi = new Voronoi(
      minx - dx / 2,
      miny - dy / 2,
      maxx + dx / 2,
      maxy + dy / 2,
    )
    for (let v of vertices) {
      voronoi.addPoint(v)
    }
    return voronoi
  }

  public static relax(voronoi: Voronoi, toRelax: Vector3[]): Voronoi {
    const regions = voronoi.partioning()

    let points = [...voronoi.points]
    for (let p of voronoi.frame) {
      points = points.filter(v => v !== p)
    }

    if (toRelax == null) {
      toRelax = voronoi.points
    }
    for (let r of regions) {
      if (toRelax.includes(r.seed)) {
        points = points.filter(v => v !== r.seed)
        points.push(r.center())
      }
    }

    return Voronoi.build(points)
  }
}
