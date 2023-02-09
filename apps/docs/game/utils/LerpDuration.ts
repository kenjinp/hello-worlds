import { remap } from "@hello-worlds/planets"
import { MathUtils } from "three"

export class LerpDuration {
  public lerpStart = Date.now()
  public lerpProgress = 0
  public lastValue: any
  constructor(public lerpDuration = 5_000) {}

  lerp(x: number, y: number) {
    const now = Date.now()
    const delta = now - this.lerpStart
    this.lerpProgress = Math.min(delta, this.lerpDuration)
    const alpha = Math.min(
      1,
      remap(this.lerpProgress, 0, this.lerpDuration, 0, 1),
    )
    return MathUtils.lerp(x, y, alpha)
  }

  reset() {
    this.lerpStart = Date.now()
    this.lerpProgress = 0
  }
}
