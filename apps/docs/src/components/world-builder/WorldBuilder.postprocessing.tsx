import { useTexture } from "@react-three/drei"
import * as React from "react"
import * as RC from "render-composer"
import { Vector3 } from "three"
import {
  AtmosphereEffect,
  PlanetAtmosphere,
  Sun,
} from "./vfx/atmosphere/AtmosphereEffect"
import { ECS } from "./WorldBuilder.state"

const AtmosphereEffects = () => {
  const { entities: planetsWithAtmosphere } = ECS.useArchetype(
    "planet",
    "atmosphereRadius",
  )
  const { entities: suns } = ECS.useArchetype("star")

  const mappedPlanets: PlanetAtmosphere[] = planetsWithAtmosphere.map(
    entity => ({
      origin: entity.position,
      radius: entity.radius,
      atmosphereRadius: entity.atmosphereRadius,
    }),
  )

  const mappedSuns: Sun[] = suns.map(entity => ({
    origin: entity.position,
    intensity: entity.intensity * 100,
    color: new Vector3(entity.color.r, entity.color.g, entity.color.b),
  }))

  return suns.length && mappedPlanets.length ? (
    <AtmosphereEffect planets={mappedPlanets} suns={mappedSuns} />
  ) : null
}

export const PostProcessing: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <RC.RenderPipeline>
      <RC.EffectPass>
        <AtmosphereEffects />
        <RC.SMAAEffect />
        <RC.SelectiveBloomEffect intensity={5} luminanceThreshold={0.8} />
        <ECS.ArchetypeEntities archetype={["star"]}>
          {entity => {
            return entity.mesh && <RC.GodRaysEffect lightSource={entity.mesh} />
          }}
        </ECS.ArchetypeEntities>
        <RC.VignetteEffect />
        <RC.LensDirtEffect
          texture={useTexture("/img/lensdirt.jpg")}
          strength={0.1}
        />
        <React.Suspense fallback={null}>{children}</React.Suspense>
      </RC.EffectPass>
    </RC.RenderPipeline>
  )
}
