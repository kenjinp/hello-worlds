import { useFrame, useThree } from "@react-three/fiber"
import { useEntities } from "miniplex/react"
import { damp } from "three/src/math/MathUtils"
import { useGodCamera } from "./cameras/GodCamera"
import { archetypes } from "./Entity"
import { vec3Pool } from "./Pools"
import { useFly } from "./systems/Fly"

// const gravitationalConstant = 6.673e-11;
// const gravAcceleration = (massBody: number, massTarget: number, distance: number) => gravitationalConstant * massBody * massTarget / Math.pow(distance, 2)

const gravAcceleration = (gravity: number, delta: number) => gravity * delta

export const useGravity = () => {
  const { entities } = useEntities(archetypes.affectedByGravity)

  useFrame((_, delta) => {
    for (const entity of entities) {
      const { closestAstronomicalObject, sceneObject, velocity } = entity
      if (!closestAstronomicalObject) continue
      const { sceneObject: sceneObjectPlanet, gravity } =
        closestAstronomicalObject

      if (!sceneObjectPlanet) continue

      // points to planet core
      const direction = vec3Pool
        .get()
        .copy(sceneObjectPlanet.position)
        .sub(sceneObject.position)
        .normalize()

      const newVelocity = direction.multiplyScalar(
        gravAcceleration(gravity, delta),
      )
      velocity.add(newVelocity)

      vec3Pool.release(direction)
    }
  })

  return null
}

export const useVelocity = () => {
  const { entities } = useEntities(archetypes.physics)

  useFrame(() => {
    for (const entity of entities) {
      const { sceneObject, velocity } = entity

      sceneObject.position.add(velocity)
    }
  })

  return null
}

export const useClosestPlanet = () => {
  const { entities: planets } = useEntities(archetypes.planetOrMoon)
  const { entities: tracking } = useEntities(
    archetypes.trackingClosestAstroObject,
  )

  useFrame(() => {
    for (const tracker of tracking) {
      const closestPlanetToEntity = planets.sort((a, b) => {
        return (
          tracker.sceneObject.position.distanceToSquared(a.position) -
          tracker.sceneObject.position.distanceToSquared(b.position)
        )
      })[0]
      if (tracker.closestAstronomicalObject === closestPlanetToEntity) return
      tracker.closestAstronomicalObject = closestPlanetToEntity
    }
  })

  return null
}

function useCamera() {
  const { entities: focused } = useEntities(archetypes.cameraFollow)
  // const { entities: cameras } = useEntities(archetypes.camera)

  // The first element is considered the primary camera.
  // const camera = cameras[0]
  const target = focused[focused.length - 1]

  const camera = useThree(s => s.camera)

  // The last element is considered the target.

  useFrame((_, delta) => {
    if (!target) {
      return
    }

    // Every frame damp towards the target position.
    camera.position.setX(
      damp(camera.position.x, target.sceneObject.position.x, 4, delta),
    )
    camera.position.setY(
      damp(camera.position.y, target.sceneObject.position.y, 4, delta),
    )
    camera.position.setZ(
      damp(camera.position.z, target.sceneObject.position.z, 4, delta),
    )
  })
}

export function WorldSystems() {
  useClosestPlanet()
  useGravity()
  useVelocity()
  useCamera()
  useFly()
  useGodCamera()

  return null
}
