import {
  AtmosphereEffect,
  PlanetAtmosphere,
  Sun,
} from "@site/src/components/world-builder/vfx/atmosphere/AtmosphereEffect"
import { archetypes } from "@site/src/components/world-builder/WorldBuilder.state"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Vector3 } from "three"

export const AtmosphereEffects: React.FC = () => {
  const { entities: planetsWithAtmosphere } = useEntities(
    archetypes.planetWithAtmosphere,
  )
  const { entities: suns } = useEntities(archetypes.star)

  const mappedPlanets: PlanetAtmosphere[] = planetsWithAtmosphere.map(
    entity => ({
      origin: entity.position,
      radius: entity.radius,
      atmosphereRadius: entity.atmosphereRadius,
    }),
  )

  const mappedSuns: Sun[] = suns.map(entity => ({
    origin: entity.position!,
    intensity: entity.lightIntensity * 10,
    color: new Vector3(entity.color.r, entity.color.g, entity.color.b),
  }))

  return suns.length && mappedPlanets.length ? (
    <AtmosphereEffect
      key={suns.length * Math.random()}
      planets={mappedPlanets}
      suns={mappedSuns}
    />
  ) : null
}
