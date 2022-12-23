import { AU } from "@game/Math"
import { usePlanet } from "@hello-worlds/react"
import { useControls } from "leva"
import * as React from "react"
import { Vector3 } from "three"
import { AtmosphereEffect } from "./AtmosphereEffect"

export const Atmosphere: React.FC<{ position: Vector3 }> = ({ position }) => {
  const planet = usePlanet()

  const atmosphere = useControls("atmosphere", {
    atmosphereRadius: {
      min: 1,
      max: planet.radius * 5,
      value: planet.radius + 120_000,
      step: 1,
    },
  })

  // TODO fix update position, radius, sun position
  return (
    <AtmosphereEffect
      planetOrigin={position}
      planetRadius={planet.radius}
      sunPosition={new Vector3(-1, 0, 1).multiplyScalar(AU).divideScalar(4)}
      atmosphereRadius={atmosphere.atmosphereRadius}
    />
  )
}
