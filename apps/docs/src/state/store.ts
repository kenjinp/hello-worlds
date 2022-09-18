import { makeStore } from "statery"
import { Mesh } from "three"

export const store = makeStore({
  sun: null as Mesh | null
})
