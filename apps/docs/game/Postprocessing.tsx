import { useTexture } from "@react-three/drei"
import { useEntities } from "miniplex/react"
import * as React from "react"
import * as RC from "render-composer"
import { Vector3 } from "three"
import {
  AtmosphereEffect,
  PlanetAtmosphere,
  Sun,
} from "./vfx/atmosphere/AtmosphereEffect"
import { archetypes } from "./WorldBuilder.state"

const AtmosphereEffects = () => {
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
    intensity: entity.lightIntensity,
    color: new Vector3(entity.color.r, entity.color.g, entity.color.b),
  }))

  console.log({ mappedSuns, mappedPlanets })

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
        <RC.SMAAEffect />
        <RC.SelectiveBloomEffect intensity={5} luminanceThreshold={0.8} />
        {/* <ECS.ArchetypeEntities archetype={["star"]}>
          {entity => {
            return entity.mesh && <RC.GodRaysEffect lightSource={entity.mesh} />
          }}
        </ECS.ArchetypeEntities> */}
        <RC.VignetteEffect />
        <RC.LensDirtEffect
          texture={useTexture("/img/lensdirt.jpg")}
          strength={0.025}
        />
        <React.Suspense fallback={null}>{children}</React.Suspense>
        <AtmosphereEffects />
      </RC.EffectPass>
    </RC.RenderPipeline>
  )
}
