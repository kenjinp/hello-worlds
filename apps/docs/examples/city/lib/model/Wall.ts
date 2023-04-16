import { Vector3 } from "three"
import { Polygon } from "../math/Polygon"
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
          this.shape.vertices.map(v => {
            const isReserved = reserved.some(r => r.equals(v))
            if (isReserved) {
              return v
            }
            const smoothed = this.shape.smoothVertex(v, smoothFactor)
            for (let patch of this.model.patches) {
              const i = patch.shape.vertices.indexOf(v)
              if (i !== -1) {
                patch.shape.vertices[i] = smoothed
              }
            }
            return smoothed
          }),
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
    const entrances: Array<Vector3> =
      this.patches.length > 1
        ? this.shape.vertices.filter(v => {
            const notReservered = !reserved.some(v3 => v3.equals(v))
            const hasMoreThanOneAdjacentPatch =
              this.patches.filter(p => p.shape.contains(v)).length > 1
            return notReservered && hasMoreThanOneAdjacentPatch
          })
        : this.shape.vertices.filter(v => !reserved.some(v3 => v3.equals(v)))

    if (!entrances.length) {
      console.warn("bad walled area shape")
      // throw new Error("Bad walled area shape!")
      return
    }

    do {
      let index = random.int(0, entrances.length)
      let gate = entrances[index]
      this.gates.push(gate)

      if (real) {
        let outerWards = model
          .patchByVertex(gate)
          .filter(ward => !this.patches.includes(ward))
        if (outerWards.length == 1) {
          // If there is no road leading from the walled patches,
          // we should make one by splitting an outer ward
          let outer = outerWards[0]
          // its a true polygon
          if (outer.shape.length > 3) {
            let wall = this.shape.next(gate).clone().sub(this.shape.prev(gate))
            let out = new Vector3(wall.y, -wall.x, 0)

            let farthest = outer.shape.maxPredicate(v => {
              if (this.shape.contains(v) || reserved.some(v3 => v3.equals(v)))
                return -Infinity
              else {
                let dir = v.clone().sub(gate)
                return dir.dot(out) / dir.length()
              }
            })

            let newPatches = outer.shape
              .split(gate, farthest)
              .map(half => new Patch(half.vertices))

            model.patches = replaceInArray(model.patches, outer, newPatches)
          }
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

    if (!this.gates.length) throw new Error("Bad walled area shape!")

    // Smooth further sections of the wall with gates
    if (real) {
      for (let gate of this.gates) {
        if (!gate) {
          throw new Error("no gate")
        }
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
    if (index !== -1 && this.segments[index]) {
      return true
    }

    return false
  }

  public bordersPatch(p: Patch): boolean {
    let withinWalls = this.patches.includes(p)
    let length = this.shape.length

    for (let i = 0; i < length; i++) {
      if (this.segments[i]) {
        let v0 = this.shape[i]
        let v1 = this.shape[(i + 1) % length]
        let index = withinWalls
          ? p.shape.findEdge(v0, v1)
          : p.shape.findEdge(v1, v0)
        if (index != -1) return true
      }
    }

    return false
  }
}
