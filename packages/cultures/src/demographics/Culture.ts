import { randomRange, sample } from "@hello-worlds/core"
import { PowerSource, sourceOfPower, traits, values } from "./Culture.traits"

export interface Aesthetics {}

export default class Culture {
  values = sample(values, 2)
  traits = sample(traits, randomRange(2, 3))
  power: PowerSource[]
  constructor() {
    if (this.hasValue("Freedom")) {
      this.power = [
        sourceOfPower.filter(({ name }) => name !== "Autocracy")[
          randomRange(0, 1)
        ],
      ]
      return
    }
    this.power = [sourceOfPower[randomRange(0, sourceOfPower.length - 1)]]
  }

  hasValue(valueName: string) {
    return !!this.values.filter(({ name }) => name === valueName).length
  }
}
