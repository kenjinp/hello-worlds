import { sample } from "@hello-worlds/core"
import { Vector3 } from "three"
import { sign } from "../math/helpers"
import { Polygon } from "../math/Polgygon"
import { Random } from "../math/Random"
import { Segment } from "../math/Segment"
import { Topology } from "../math/Topology"
import { Voronoi } from "../math/Voronoi"
import { Castle } from "../ward/Castle"
import { GateWard } from "../ward/GateWard"
import { Market } from "../ward/Market"
import { Slum } from "../ward/Slum"
import { Patch } from "./Patch"
import { CityWall } from "./Wall"

export type Street = Polygon

export class CityModel {
  random: Random
  plazaNeeded: boolean
  citadelNeeded: boolean
  wallsNeeded: boolean
  voronoi: Voronoi
  patches: Patch[] = []

  // For a walled city it's a list of patches within the walls,
  // for a city without walls it's just a list of all city wards
  inner: Patch[] = []
  citadel?: Patch
  plaza?: Patch
  center?: Vector3

  // the defactor border of the city, where density is highest
  border: CityWall

  // the optional city wall, which will follow the border of the city
  wall?: CityWall

  // List of all entrances of a city including castle gates for walled cities
  // or just the main entrance for cities without walls
  gates: Vector3[] = []

  topology: Topology

  // Joined list of streets (inside walls) and roads (outside walls)
  // without diplicating segments
  public arteries: Array<Street> = []
  public streets: Array<Street> = []
  public roads: Array<Street> = []

  constructor(
    private nPatches = 15,
    private offset = new Vector3(),
    public seed?: string,
  ) {
    this.random = new Random(seed)

    this.plazaNeeded = this.random.bool()
    // citadel stuff is a bit borked atm
    this.citadelNeeded = false //this.random.bool()
    this.wallsNeeded = false //this.random.bool()
    this.build()

    // errors can sometimes happen when building the city
    // so we just try again until it works

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

    console.time("buildStreets")
    this.buildStreets()
    console.timeEnd("buildStreets")

    console.time("createWards")
    this.createWards()
    console.timeEnd("createWards")

    console.time("buildGeometry")
    this.buildGeometry()
    console.timeEnd("buildGeometry")
  }

  buildPatches() {
    const sa = this.random.float() * 2 * Math.PI

    const points = new Array(this.nPatches * 8).fill(0).map((_, i) => {
      // if (i <= this.nPatches) {
      //   // create a square shape around the center
      //   const x = (i % 2) * 5 - 2 + this.offset.x
      //   const y = Math.floor(i / 2) * 5 - 2 + this.offset.y
      //   const v = new Vector3(x, y, 0)
      //   return v
      // }
      let a = sa + Math.sqrt(i) * 5
      let r = i == 0 ? 0 : 10 + i * (2 + this.random.float())
      const x = Math.cos(a) * r + this.offset.x
      const y = Math.sin(a) * r + this.offset.y
      return new Vector3(x, y, 0)
    })

    console.log("points", points)
    console.time("building voronoi")
    let voronoi = Voronoi.build(points)
    this.voronoi = voronoi
    console.log({ voronoi })
    console.timeEnd("building voronoi")

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

    voronoi.points.sort((p1, p2) => {
      return sign(p1.length() - p2.length())
    })
    let regions = voronoi.partioning()
    console.log({ regions })

    this.patches = []

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

  private buildWalls() {
    // This reserved shape will be used to place the citadel, if necessary
    const reservedShape =
      this.citadel != null ? this.citadel.shape.copy() : new Polygon([])

    this.border = new CityWall(
      this.wallsNeeded,
      this,
      this.inner,
      reservedShape.vertices,
    )

    console.log({ border: this.border })

    // let's place towers along the wall
    if (this.wallsNeeded) {
      this.wall = this.border
      this.wall.buildTowers()
    }

    // lets get rid of patches that are too far away (we dont care about them)
    let radius = this.border.getRadius()
    this.patches = this.patches.filter(
      p => p.shape.minDistance(this.center) < radius * 3,
    )

    this.gates = this.border.gates
    if (this.citadel) {
      let castle = new Castle(this, this.citadel)
      castle.wall.buildTowers()
      this.citadel.ward = castle
      if (this.citadel.shape.compactness < 0.75)
        throw new Error("Bad citadel shape!")
      this.gates = this.gates.concat(castle.wall.gates)
    }
  }

  private optimizeJunctions() {
    const patchesToOptimize: Array<Patch> = !this.citadel
      ? this.inner
      : this.inner.concat([this.citadel])

    const wardsToClean: Array<Patch> = []
    for (let w of patchesToOptimize) {
      let index = 0
      while (index < w.shape.length) {
        const v0 = w.shape.vertices[index]
        const v1 = w.shape.vertices[(index + 1) % w.shape.length]

        if (v0 !== v1 && v0.distanceTo(v1) < 8) {
          for (let w1 of this.patchByVertex(v1)) {
            if (w1 !== w) {
              w1.shape.vertices[w1.shape.vertices.indexOf(v1)] = v0
              wardsToClean.push(w1)
            }
          }

          v0.add(v1)
          v0.multiplyScalar(0.5)

          w.shape.remove(v1)
        }
        index++
      }
    }

    // Removing duplicate vertices
    for (let w of wardsToClean) {
      for (let i = 0; i < w.shape.length; i++) {
        let v = w.shape.vertices[i]
        let dupIdx
        while ((dupIdx = w.shape.vertices.indexOf(v, i + 1)) !== -1) {
          w.shape.vertices.splice(dupIdx, 1)
        }
      }
    }
  }

  public patchByVertex(v: Vector3) {
    return this.patches.filter(patch => patch.shape.contains(v))
  }

  public static findCircumference(patch: Patch[]): Polygon {
    console.log("findCircumference", patch)
    if (patch.length == 0) {
      return new Polygon()
    } else if (patch.length == 1) {
      return new Polygon(patch[0].shape.vertices)
    }

    const verticesA: Array<Vector3> = []
    const verticesB: Array<Vector3> = []

    for (let p1 of patch) {
      p1.shape.forEdge((a, b) => {
        let outerEdge = true
        let backwards = false
        for (let p2 of patch) {
          if (p1 === p2) {
            continue
          }
          if (p2.shape.sharesEdges(b, a)) {
            outerEdge = false
            break
          }
          if (p2.shape.sharesEdges(a, b)) {
            backwards = true
            outerEdge = false
            break
          }
        }
        if (outerEdge && !backwards) {
          verticesA.push(a)
          verticesB.push(b)
        }
        if (outerEdge && backwards) {
          verticesA.push(b)
          verticesB.push(a)
        }
      })
    }

    const result = new Polygon()

    let index = 0
    do {
      result.vertices.push(verticesA[index])
      index = verticesA.indexOf(verticesB[index])
    } while (index != 0)

    return result
  }

  private buildStreets() {
    function smoothStreet(street: Street) {
      let smoothed = street.smoothVertexEq(3)
      for (let i = 1; i < street.length - 1; i++) {
        street.vertices[i].copy(smoothed[i])
      }
    }

    this.topology = new Topology(this)

    for (let gate of this.gates) {
      // Each gate is connected to the nearest corner of the plaza or to the central junction
      let end = this.plaza
        ? this.plaza.shape.minPredicate(v => v.distanceTo(gate))
        : this.center

      let street = this.topology.buildPath(
        gate,
        end,
        Array.from(this.topology.outer.values()),
      )
      console.log("street", street)
      if (street) {
        this.streets.push(new Polygon(street))
        // TODO build roads that lead outwards to the countryside

        // if (this.border.gates.includes(gate)) {
        //   let dir = gate.normalize().multiplyScalar(1000)
        //   let start = null
        //   let dist = Infinity
        //   for (let point of this.topology.nodeToVector3.values()) {
        //     let d = point.distanceTo(dir)
        //     if (d < dist) {
        //       dist = d
        //       start = point
        //     }
        //   }

        //   let road = this.topology.buildPath(
        //     start,
        //     gate,
        //     Array.from(this.topology.inner.values()),
        //   )
        //   if (road) {
        //     this.roads.push(new Polygon(road))
        //   }
        // }
      } else {
        throw new Error("Unable to build a street!")
      }
    }

    this.tidyUpRoads()

    for (let a of this.arteries) {
      smoothStreet(a)
    }
  }

  private tidyUpRoads() {
    let segments = new Array<Segment>()

    const cut2segments = (street: Street) => {
      let v0: Vector3 = null
      let v1: Vector3 = street.vertices[0]
      for (let i = 1; i < street.length; i++) {
        v0 = v1
        v1 = street.vertices[i]

        // Removing segments which go along the plaza
        if (
          this.plaza &&
          this.plaza.shape.contains(v0) &&
          this.plaza.shape.contains(v1)
        )
          continue

        let exists = false
        for (let seg of segments)
          if (seg.start == v0 && seg.end == v1) {
            exists = true
            break
          }

        if (!exists) segments.push(new Segment(v0, v1))
      }
    }

    for (let street of this.streets) cut2segments(street)
    for (let road of this.roads) cut2segments(road)

    this.arteries = []
    while (segments.length > 0) {
      let seg = segments.pop()

      let attached = false
      for (let a of this.arteries)
        if (a[0] == seg.end) {
          a.vertices.unshift(seg.start)
          attached = true
          break
        } else if (a.last === seg.start) {
          a.vertices.push(seg.end)
          attached = true
          break
        }

      if (!attached) this.arteries.push(new Polygon([seg.start, seg.end]))
    }
  }

  private createWards() {
    let unassigned = [...this.inner]

    const removeUnassignedPatch = (patch: Patch) => {
      unassigned = unassigned.filter(p => p !== patch)
    }

    if (this.plaza) {
      this.plaza.ward = new Market(this, this.plaza)

      // Removing the plaza from the list of unassigned patches
      removeUnassignedPatch(this.plaza)
    }

    // Assigning inner city gate wards
    for (let gate of this.border.gates) {
      for (let patch of this.patchByVertex(gate)) {
        if (
          patch.withinCity &&
          !patch.ward &&
          this.random.bool(!this.wall ? 0.2 : 0.5)
        ) {
          patch.ward = new GateWard(this, patch)
          removeUnassignedPatch(patch)
        }
      }
    }

    // let wards = WARDS.copy();
    // // some shuffling
    // for (i in 0...Std.int(wards.length / 10)) {
    // 	let index = Random.int( 0, (wards.length - 1) );
    // 	let tmp = wards[index];
    // 	wards[index] = wards[index + 1];
    // 	wards[index+1] = tmp;
    // }

    // // Assigning inner city wards
    while (unassigned.length > 0) {
      // 	let bestPatch:Patch = null;

      // 	let wardClass = wards.length > 0 ? wards.shift() : Slum;
      // 	let rateFunc = Reflect.field( wardClass, "rateLocation" );

      // 	if (rateFunc == null)
      // 		do
      // 			bestPatch = unassigned.random()
      // 		while (bestPatch.ward != null);
      // 	else
      // 		bestPatch = unassigned.min( function( patch:Patch ) {
      // 			return patch.ward == null ? Reflect.callMethod( wardClass, rateFunc, [this, patch] ) : Math.POSITIVE_INFINITY;
      // 		} );

      // 	bestPatch.ward = Type.createInstance( wardClass, [this, bestPatch] );
      const bestPatch = sample(unassigned)[0]
      bestPatch.ward = new Slum(this, bestPatch)
      removeUnassignedPatch(bestPatch)
    }

    // // Outskirts
    // if (wall != null)
    // 	for (gate in wall.gates) if (!Random.bool( 1 / (nPatches - 5) )) {
    // 		for (patch in patchByVertex( gate ))
    // 			if (patch.ward == null) {
    // 				patch.withinCity = true;
    // 				patch.ward = new GateWard( this, patch );
    // 			}
    // 	}

    // // Calculating radius and processing countryside
    // cityRadius = 0;
    // for (patch in patches)
    // 	if (patch.withinCity)
    // 		// Radius of the city is the farthest point of all wards from the center
    // 		for (v in patch.shape)
    // 			cityRadius = Math.max( cityRadius, v.length );
    // 	else if (patch.ward == null)
    // 		patch.ward = Random.bool( 0.2 ) && patch.shape.compactness >= 0.7 ?
    // 			new Farm( this, patch ) :
    // 			new Ward( this, patch );
  }

  private buildGeometry() {
    for (let patch of this.patches) {
      patch.ward?.createGeometry()
    }
  }

  public getNeighbor(patch: Patch, v: Vector3): Patch {
    let next = patch.shape.next(v)
    for (let p of this.patches) if (p.shape.hasEdge(next, v)) return p
    return null
  }

  public getNeighbors(patch: Patch): Array<Patch> {
    return this.patches.filter(
      p => p !== patch && p.shape.bordersPolygon(patch.shape),
    )
  }

  // A ward is "enclosed" if it belongs to the city and
  // it's surrounded by city wards and/or water
  public isEnclosed(patch: Patch) {
    return (
      patch.withinCity &&
      (patch.withinWalls || this.getNeighbors(patch).every(p => p.withinCity))
    )
  }
}
