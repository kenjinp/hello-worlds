import { Sun } from "@site/src/components/world-builder/vfx/atmosphere/AtmosphereEffect"
import {
  OceanEffect,
  PlanetWithOcean,
} from "@site/src/components/world-builder/vfx/ocean/ocean-effect/OceanEffect"
import { world } from "@site/src/components/world-builder/WorldBuilder.ecs"
import { archetypes } from "@site/src/components/world-builder/WorldBuilder.state"
import { useControls } from "leva"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Color, Vector3 } from "three"

const colorA = new Color(0x1df7ff).getStyle()
const colorB = new Color(0x02040a).getStyle()

export const OceanEffects: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { entities: planetsWithOceans } = useEntities(
    archetypes.planetWithOcean,
  )
  const { entities: suns } = useEntities(archetypes.star)

  const mappedPlanets: PlanetWithOcean[] = planetsWithOceans.map(entity => ({
    origin: entity.position,
    radius: entity.radius + 0.05,
    seaLevel: entity.seaLevel + 0.05,
  }))

  const mappedSuns: Sun[] = suns.map(entity => ({
    origin: entity.position,
    intensity: entity.lightIntensity * 10,
    color: new Vector3(entity.color.r, entity.color.g, entity.color.b),
  }))

  const { orbitMode, ...oceanProps } = useControls({
    planetScale: 5000,
    alphaMultiplier: { value: 54, step: 0.0001 },
    smoothness: { value: 0.92, step: 0.0001 },
    depthMultiplier: { value: 14, step: 0.0001 },
    colorA,
    colorB,
    orbitMode: true,
  })

  React.useEffect(() => {
    if (orbitMode) {
      const planet = world.archetype("planet").first
      if (planet) {
        world.addComponent(planet, "focused", true)
        world.update(planet)
      }
    } else {
      const focused = world.archetype("focused").first
      world.removeComponent(focused, "focused")
      world.update(focused)
    }
  }, [orbitMode])

  return suns.length && mappedPlanets.length ? (
    <OceanEffect
      key={suns.length * Math.random()}
      planets={mappedPlanets}
      suns={mappedSuns}
      {...oceanProps}
    >
      {children}
    </OceanEffect>
  ) : (
    children
  )
}
