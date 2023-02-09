import {
  AtmosphereEffect,
  PlanetAtmosphere,
  Sun,
} from "@components/vfx/post-processing/atmosphere/AtmosphereEffect"
import { archetypes } from "@game/Entity"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Color, Vector3 } from "three"

const colorA = new Color(0x1df7ff).getStyle()
const colorB = new Color(0x02040a).getStyle()

export const AtmosphereEffects: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const camera = useThree(state => state.camera)
  const { entities: planetsWithAtmosphere } = useEntities(
    archetypes.planetWithAtmosphere,
  )
  const { entities: suns } = useEntities(archetypes.star)

  // TODO This should 'watch' the entitites' ocean values as well

  const blah = useControls({
    planetScale: 5000,
    primarySteps: { value: 12 },
    lightSteps: { value: 10 },
    alphaMultiplier: { value: 54, step: 0.0001 },
    smoothness: { value: 0.92, step: 0.0001 },
    depthMultiplier: { value: 14, step: 0.0001 },
    colorA,
    colorB,
    orbitMode: true,
  })

  // TODO we should provide a sorting index buffer for the planets by distance to the camera
  // right now we can ugly shadows because the planets are rendered in the order they are in the array

  const mappedPlanets: PlanetAtmosphere[] = planetsWithAtmosphere
    .map(entity => ({
      origin: entity.position,
      radius: entity.radius,
      atmosphereRadius: entity.atmosphereRadius,
    }))
    .sort((a, b) => {
      const distanceToCameraA = a.origin.distanceTo(camera.position)
      const distanceToCameraB = b.origin.distanceTo(camera.position)
      return distanceToCameraB - distanceToCameraA
    })

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
      primarySteps={blah.primarySteps}
      lightSteps={blah.lightSteps}
    >
      {children}
    </AtmosphereEffect>
  ) : (
    children
  )
}
