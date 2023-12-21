import { wrapEffect } from "@react-three/postprocessing"
import { AtmosphereEffect } from "./Atmosphere.effect"

// Sometimes I hate typescript.
// This should be able to be inferred.
export const Atmosphere: ReturnType<
  typeof wrapEffect<typeof AtmosphereEffect>
> = wrapEffect(AtmosphereEffect)
