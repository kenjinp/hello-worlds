import { Sun } from "@site/src/components/world-builder/vfx/atmosphere/AtmosphereEffect"
import {
  OceanEffect,
  PlanetWithOcean,
} from "@site/src/components/world-builder/vfx/ocean/ocean-effect/OceanEffect"
import { archetypes } from "@site/src/components/world-builder/WorldBuilder.state"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Vector3 } from "three"

export const OceanEffects: React.FC = () => {
  const { entities: planetsWithOceans } = useEntities(
    archetypes.planetWithOcean,
  )
  const { entities: suns } = useEntities(archetypes.star)

  const mappedPlanets: PlanetWithOcean[] = planetsWithOceans.map(entity => ({
    origin: entity.position,
    radius: entity.radius,
    seaLevel: entity.seaLevel,
  }))

  const mappedSuns: Sun[] = suns.map(entity => ({
    origin: entity.position,
    intensity: entity.lightIntensity * 10,
    color: new Vector3(entity.color.r, entity.color.g, entity.color.b),
  }))

  return suns.length && mappedPlanets.length ? (
    <OceanEffect
      key={suns.length * Math.random()}
      planets={mappedPlanets}
      suns={mappedSuns}
    />
  ) : null
}
