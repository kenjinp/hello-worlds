import { Vector3 } from "three"

export class Vector3Pool {
  private pool: Vector3[]
  poolSize: number

  constructor(poolSize: number) {
    this.pool = new Array(poolSize).fill(new Vector3())
    this.poolSize = poolSize
  }

  public get(): THREE.Vector3 {
    const tempVector3 = this.pool.pop()
    if (tempVector3) {
      return tempVector3
    } else {
      console.warn(
        "Vector3Pool ran out of objects. Consider increasing the pool size.",
      )
      return new Vector3()
    }
  }

  public release(vector3: THREE.Vector3): void {
    vector3.set(0, 0, 0)
    this.pool.push(vector3)
  }
}
