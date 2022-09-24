import { usePlanet } from "@hello-worlds/react"
import { useControls } from "leva"
import * as React from "react"
import { Vector3 } from "three"
import { AtmosphereEffect } from "./AtmosphereEffect"

export const Atmosphere: React.FC = () => {
  const planet = usePlanet()
  const atmosphere = useControls("atmosphere", {
    atmosphereRadius: {
      min: 1,
      max: planet.planetProps.radius * 5,
      value: planet.planetProps.radius * 2.0,
      step: 1,
    },
  })

  // TODO fix update position and radius
  return (
    <AtmosphereEffect
      planetOrigin={planet.rootGroup.position}
      planetRadius={planet.planetProps.radius}
      sunPosition={new Vector3(-1, 0.75, 1).multiplyScalar(10_000)}
      atmosphereRadius={atmosphere.atmosphereRadius}
    />
  )
}
