import { ECS } from "@game/ECS"
import { Planet, RingWorld, WORLD_TYPES } from "@hello-worlds/planets"
import { Object3D, Raycaster } from "three"
import { match } from "ts-pattern"

export const ALTITUDE_RAYCAST_LAYER = 1

const raycaster = new Raycaster()
raycaster.layers.set(ALTITUDE_RAYCAST_LAYER)

const getApproximateAltitudeOfSpheroid = (
  object: Object3D,
  helloPlanet: Planet | RingWorld,
) => {
  return (
    object.position.distanceTo(helloPlanet.position) - helloPlanet.radius || 0
  )
}

// NOTE to use this hook
// currentEntity must have the "closestAstronomicalObject" component
// otherwise it will return Infinity
export function useAltitude(sceneObject: Object3D) {
  const entity = ECS.useCurrentEntity()

  const getApproximateAltitude = () => {
    // get closest world
    const closestAstroObject = entity.closestAstronomicalObject
    if (!closestAstroObject) {
      return Infinity
    }

    // get closest world type
    const worldType = closestAstroObject.helloPlanet.worldType

    const _getAltitude = match(worldType)
      .with(WORLD_TYPES.PLANET, () => getApproximateAltitudeOfSpheroid)
      .otherwise(() => getApproximateAltitudeOfSpheroid)

    return _getAltitude(sceneObject, closestAstroObject.helloPlanet)
  }

  const getExactAltitude = () => {
    const closestAstroObject = entity.closestAstronomicalObject
    if (!closestAstroObject) {
      return Infinity
    }
    const dir = closestAstroObject.position
      .sub(sceneObject.position)
      .normalize()
    raycaster.set(sceneObject.position, dir)
    const hit = raycaster.intersectObject(closestAstroObject.helloPlanet, true)
    const firstHit = hit[0]
    if (firstHit) {
      return firstHit.distance
    }
    return getApproximateAltitude()
  }

  return {
    getExactAltitude,
    getApproximateAltitude,
  }
}
