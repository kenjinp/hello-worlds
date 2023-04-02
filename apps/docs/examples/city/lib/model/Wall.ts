import { Vector3 } from "three"
import { Polygon } from "../math/Polgygon"
import { Random } from "../math/Random"
import { CityModel } from "./Model"
import { Patch } from "./Patch"

const random = new Random()

const replaceInArray = <T>(arr: T[], oldItem: T, newItems: T[]) => {
  const index = arr.indexOf(oldItem)
  if (index === -1) return arr
  return [...arr.slice(0, index), ...newItems, ...arr.slice(index + 1)]
}

export class CityWall {
  shape: Polygon
  segments: boolean[]
  gates: Vector3[]
  towers: Vector3[]
  constructor(
    public real = true,
    public model: CityModel,
    public patches: Patch[],
    public reserved: Vector3[],
  ) {
    if (patches.length === 1) {
      this.shape = patches[0].shape
    } else {
      this.shape = CityModel.findCircumference(this.patches)

      if (real) {
        const smoothFactor = Math.min(1, 40 / patches.length)
        this.shape.set(
          this.shape.vertices.map(v =>
            reserved.some(r => r.equals(v))
              ? v
              : this.shape.smoothVertex(v, smoothFactor),
          ),
        )
      }
    }

    this.segments = [...this.shape.vertices].map(() => true)

    this.buildGates(real, model, reserved)
  }

  private buildGates(real: boolean, model: CityModel, reserved: Vector3[]) {
    this.gates = []
    // Entrances are vertices of the walls with more than 1 adjacent inner ward
    // so that a street could connect it to the city center
    console.log("building gates", this.patches, real, model, reserved)
    const entrances: Array<Vector3> =
      // this.patches.length > 1
      //   ? this.shape.vertices.filter(v => {
      //       const notReservered = !reserved.some(v3 => v3.equals(v))
      //       const numAdjactentPatches =
      //         this.patches.filter(p => p.shape.contains(v)).length > 1
      //       console.log({ notReservered, numAdjactentPatches })
      //       return notReservered && numAdjactentPatches
      //     })
      //   :

      this.shape.vertices.filter(v => !reserved.some(v3 => v3.equals(v)))

    console.log({ entrances })

    if (!entrances.length) {
      // throw new Error("Bad walled area shape!")
      console.warn("bad walled area shape")
    }

    do {
      let index = random.int(0, entrances.length)
      let gate = entrances[index]
      this.gates.push(gate)

      if (real) {
        try {
          let outerWards = model
            .patchByVertex(gate)
            .filter(ward => !this.patches.includes(ward))
          console.log({ outerWards, o: model.patchByVertex(gate) })
          if (outerWards.length == 1) {
            // If there is no road leading from the walled patches,
            // we should make one by splitting an outer ward
            let outer = outerWards[0]
            if (outer.shape.length > 3) {
              let wall = this.shape.next(gate).sub(this.shape.prev(gate))
              let out = new Vector3(wall.y, -wall.x, 0)

              let farthest = outer.shape.maxPredicate(v => {
                if (this.shape.contains(v) || reserved.some(v3 => v3.equals(v)))
                  return -Infinity
                else {
                  let dir = v.sub(gate)
                  return dir.dot(out) / dir.length()
                }
              })

              let newPatches = outer.shape
                .split(gate, farthest)
                .map(half => new Patch(half.vertices))

              console.log({ newPatches })
              model.patches = replaceInArray(model.patches, outer, newPatches)
            }
          }
        } catch (error) {
          console.warn("failed to do outer ward stuff ")
          console.error(error)
        }
      }

      // Removing neighboring entrances to ensure
      // that no gates are too close
      if (index == 0) {
        entrances.splice(0, 2)
        entrances.pop()
      } else if (index == entrances.length - 1) {
        entrances.splice(index - 1, 2)
        entrances.shift()
      } else entrances.splice(index - 1, 3)
    } while (entrances.length >= 3)

    if (this.gates.length == 0) throw new Error("Bad walled area shape!")

    console.log({ gates: this.gates })

    // // Smooth further sections of the wall with gates
    if (real) {
      for (let gate of this.gates) {
        gate.copy(this.shape.smoothVertex(gate))
      }
    }
  }

  public buildTowers() {
    this.towers = []
    if (this.real) {
      let len = this.shape.length
      for (let i = 0; i < len; i++) {
        let t = this.shape.vertices[i]
        if (
          !this.gates.includes(t) &&
          (this.segments[(i + len - 1) % len] || this.segments[i])
        ) {
          this.towers.push(t)
        }
      }
    }
  }

  public getRadius() {
    let radius = 0.0
    for (let v of this.shape.vertices) radius = Math.max(radius, v.length())
    return radius
  }

  public bordersBy(p: Patch, v0: Vector3, v1: Vector3) {
    let index = this.patches.includes(p)
      ? this.shape.findEdge(v0, v1)
      : this.shape.findEdge(v1, v0)
    if (index != -1 && this.segments[index]) {
      return true
    }

    return false
  }

  // public function borders( p:Patch ):Bool {
  // 	let withinWalls = patches.contains( p );
  // 	let length = shape.length;

  // 	for (i in 0...length) if (segments[i]) {
  // 		let v0 = shape[i];
  // 		let v1 = shape[(i + 1) % length];
  // 		let index = withinWalls ?
  // 			p.shape.findEdge( v0, v1 ) :
  // 			p.shape.findEdge( v1, v0 );
  // 		if (index != -1)
  // 			return true;
  // 	}

  // 	return false;
  // }
}
