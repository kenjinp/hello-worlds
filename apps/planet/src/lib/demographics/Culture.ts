import { MathUtils } from "three";
import { sample } from "../language/utils";
import { PowerSource, sourceOfPower, traits, values } from "./Culture.traits";

export interface Aesthetics {}

export default class Culture {
  values = sample(values, 2);
  traits = sample(traits, MathUtils.randInt(2, 3));
  power: PowerSource[];
  constructor() {
    if (this.hasValue("Freedom")) {
      this.power = [
        sourceOfPower.filter(({ name }) => name !== "Autocracy")[
          MathUtils.randInt(0, 1)
        ],
      ];
    }
    this.power = [
      sourceOfPower[MathUtils.randInt(0, sourceOfPower.length - 1)],
    ];
  }

  hasValue(valueName: string) {
    return !!this.values.filter(({ name }) => name === valueName).length;
  }
}
