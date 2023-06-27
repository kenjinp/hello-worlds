import { wrapEffect } from "@react-three/postprocessing"
import { AtmosphereEffect } from "./Atmosphere.effect"

export const Atmosphere = wrapEffect(AtmosphereEffect)
