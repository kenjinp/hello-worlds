import {
  AtmosphereEffect,
  PlanetAtmosphere,
  Sun,
} from "@components/vfx/post-processing/atmosphere/AtmosphereEffect"
import { archetypes } from "@game/Entity"
import { useControls } from "leva"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Color, Vector3 } from "three"

const colorA = new Color(0x1df7ff).getStyle()
const colorB = new Color(0x02040a).getStyle()

export const AtmosphereEffects: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { entities: planetsWithAtmosphere } = useEntities(
    archetypes.planetWithAtmosphere,
  )
  const { entities: suns } = useEntities(archetypes.star)

  const blah = useControls({
    planetScale: 5000,
    alphaMultiplier: { value: 54, step: 0.0001 },
    smoothness: { value: 0.92, step: 0.0001 },
    depthMultiplier: { value: 14, step: 0.0001 },
    colorA,
    colorB,
    orbitMode: true,
  })

  const mappedPlanets: PlanetAtmosphere[] = planetsWithAtmosphere.map(
    entity => ({
      origin: entity.position,
      radius: entity.radius,
      atmosphereRadius: entity.atmosphereRadius,
    }),
  )

  const mappedSuns: Sun[] = suns.map(entity => ({
    origin: entity.position,
    intensity: entity.lightIntensity * 10,
    color: new Vector3(entity.color.r, entity.color.g, entity.color.b),
  }))

  return suns.length && mappedPlanets.length ? (
    <AtmosphereEffect
      key={suns.length * Math.random()}
      planets={mappedPlanets}
      suns={mappedSuns}
    >
      {children}
    </AtmosphereEffect>
  ) : (
    children
  )
}
