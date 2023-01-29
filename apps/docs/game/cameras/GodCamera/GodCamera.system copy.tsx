import { useCanvasPointerLock } from "@components/hooks/usePointerLock"
import {
  cartesianToPolar,
  longLatToCartesian,
} from "@examples/tectonics/voronoi/math"
import { ECS, world } from "@game/ECS"
import { archetypes } from "@game/Entity"
import { Controls } from "@game/player/KeyboardController"
import { useWatchEntityComponent } from "@game/player/Player"
import { vec3Pool } from "@game/Pools"
import { remap } from "@hello-worlds/planets"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Euler, MathUtils, Object3D, Quaternion } from "three"

const getZoomScale = (zoomSpeed = 1.0) => {
  return Math.pow(0.95, zoomSpeed)
}
const _PI_2 = Math.PI / 2

const minPolarAngle = 0 // radians
const maxPolarAngle = Math.PI // radians
const pointerSpeed = 0.5
const _quat = new Quaternion()

// export const setInitialAltitude = (godCameraEntity: Entity, target: Entity) => {
//   const currentAltitude = godCameraEntity.altitude || target.radius * 1.5
//   const minAltitude = target.radius
//   const maxAltitude = target.radius * 5
//   let scale = remap(currentAltitude, minAltitude, maxAltitude, 0, 1)
//   scale = MathUtils.clamp(scale, 0, 1)
//   return remap(scale, 0, 1, minAltitude, maxAltitude)
// }

// God Camera System
export function useGodCamera() {
  const { entities: noTargets } = useEntities(archetypes.godCameraNoTarget)
  const { entities: planets } = useEntities(archetypes.planetOrMoon)

  const { entities } = useEntities(archetypes.godCamera)
  // currentGodCamera singleton (there should only ever be one)
  const godCameraEntity = ECS.useCurrentEntity()

  const camera = useThree(s => s.camera)
  const domElement = useThree(state => state.gl.domElement)
  const scene = useThree(state => state.scene)
  const [, get] = useKeyboardControls<Controls>()
  const _euler = new Euler(0, 0, 0, "YXZ")
  const target = useWatchEntityComponent(godCameraEntity, "target")
  const { isLocked, exitPointerLock } = useCanvasPointerLock()

  const { childReferenceObject, referenceObject } = React.useMemo(() => {
    const referenceObject = new Object3D()
    const childReferenceObject = new Object3D()
    referenceObject.add(childReferenceObject)
    scene.add(referenceObject)
    for (const entity of entities) {
      //
      const worldPosition = vec3Pool.get()
      const target = entity.target
      const minAltitude = target.radius
      const maxAltitude = target.radius * 5
      const currentAltitude = remap(
        entity.scale,
        0,
        1,
        minAltitude,
        maxAltitude,
      )
      target.sceneObject.getWorldPosition(worldPosition)
      const longLatPosition = longLatToCartesian(
        [entity.long, entity.lat] || [0, 0],
        currentAltitude,
      ).add(worldPosition)
      entity.sceneObject.position.copy(longLatPosition)

      const targetDirection = vec3Pool
        .get()
        .copy(worldPosition)
        .sub(entity.sceneObject.position)

      const up = targetDirection.clone().normalize()

      const rotation = new Object3D()
      rotation.lookAt(up)
      rotation.rotateX(-Math.PI / 2)

      const quat = rotation.quaternion
      referenceObject.quaternion.copy(quat)
      childReferenceObject.getWorldQuaternion(quat)
      camera.lookAt(entity.target.position)

      vec3Pool.release(targetDirection)
      vec3Pool.release(worldPosition)
    }

    return {
      childReferenceObject,
      referenceObject,
    }
  }, [scene, camera, target])

  React.useEffect(() => {
    return () => {
      scene.remove(referenceObject)
    }
  }, [childReferenceObject, referenceObject])

  // If no target, set first one
  React.useEffect(() => {
    const targetPlanet = planets[0]
    if (!targetPlanet) return
    for (const entity of noTargets) {
      world.addComponent(entity, "target", targetPlanet)
      world.addComponent(entity, "long", 0)
      world.addComponent(entity, "lat", 0)
      camera.lookAt(targetPlanet.position)
    }
  }, [noTargets, planets])

  // React.useEffect(() => {
  //   for (const entity of entities) {
  //     camera.lookAt(entity.target.sceneObject.position)
  //   }
  // }, [camera, entities[0]])

  React.useEffect(() => {
    return () => {
      exitPointerLock()
    }
  }, [])

  React.useEffect(() => {
    const scrollWheelListener = (e: WheelEvent) => {
      const delta = e.deltaY
      for (const entity of entities) {
        const target = entity.target
        const minAltitude = target.radius
        const maxAltitude = target.radius * 5
        const currentAltitude = remap(
          entity.scale,
          0,
          1,
          minAltitude,
          maxAltitude,
        )

        let speed = 1
        let scale = remap(currentAltitude, minAltitude, maxAltitude, 0, 1)
        if (delta > 0) {
          scale /= getZoomScale(speed)
        } else {
          scale *= getZoomScale(speed)
        }

        scale = MathUtils.clamp(scale, 0, 1)
        entity.scale = scale
      }
    }

    const mouseMoveListener = (e: MouseEvent) => {
      if (isLocked === false) return

      // should copy current camera position
      // so when you click it doesn't bounce around
      const movementX = e.movementX || 0
      const movementY = e.movementY || 0

      // childReferenceObject.quaternion.copy(camera.quaternion)
      _euler.setFromQuaternion(childReferenceObject.quaternion)

      _euler.y -= movementX * 0.002 * pointerSpeed
      _euler.x -= movementY * 0.002 * pointerSpeed

      _euler.x = Math.max(
        _PI_2 - maxPolarAngle,
        Math.min(_PI_2 - minPolarAngle, _euler.x),
      )

      childReferenceObject.quaternion.setFromEuler(_euler)
      childReferenceObject.getWorldQuaternion(_quat)
      camera.quaternion.copy(_quat)
    }

    domElement.addEventListener("mousemove", mouseMoveListener)
    domElement.addEventListener("wheel", scrollWheelListener)
    return () => {
      domElement.removeEventListener("mousemove", mouseMoveListener)
      domElement.removeEventListener("wheel", scrollWheelListener)
    }
  }, [isLocked, childReferenceObject, referenceObject, domElement])

  useFrame((_s, dl) => {
    camera.getWorldQuaternion(_quat)
    const targetPosition = vec3Pool.get()
    const blah = vec3Pool.get()
    const worldPosition = vec3Pool.get()
    const _velocity = vec3Pool.get()
    const state = get()
    for (const entity of entities) {
      // TODO modulate speed based on altitude
      const target = entity.target
      const minAltitude = target.radius
      const maxAltitude = target.radius * 5
      const currentAltitude = remap(
        entity.scale,
        0,
        1,
        minAltitude,
        maxAltitude,
      )

      target.sceneObject.getWorldPosition(worldPosition)
      const longLatPosition = longLatToCartesian(
        [entity.long, entity.lat],
        currentAltitude,
      ).add(worldPosition)
      entity.sceneObject.position.copy(longLatPosition)

      // worldPosition.copy(
      //   targetPosition
      //     .copy(entity.target.position)
      //     .sub(entity.sceneObject.position)
      //     .normalize()
      //     .multiplyScalar(currentAltitude),
      // )
      // entity.sceneObject.position.copy(worldPosition)
      // console.log(currentAltitude, entity.sceneObject.position)

      // console.log(entity.sceneObject.position)
      // worldPosition.copy(entity.sceneObject.position)
      // if (worldPosition.length()) {
      //   // apply scroll wheel zoom via altitude
      //   targetPosition
      //     .sub(worldPosition)
      //     .normalize()
      //     .multiplyScalar(currentAltitude)
      //   // entity.sceneObject.position.copy(worldPosition)

      //   console.log(
      //     "lets set it",
      //     // entity.scale,
      //     worldPosition.length(),
      //     copyW
      //     // entity.sceneObject.position,
      //     // worldPosition,
      //     // targetPosition,
      //   )
      // }

      const minSpeed = 5
      const maxSpeed = 100_000_000
      let speed = remap(entity.scale, 0, 1, minSpeed, maxSpeed)

      if (state.left && !state.right) _velocity.x = -1
      if (state.right && !state.left) _velocity.x = 1
      if (!state.left && !state.right) _velocity.x = 0

      if (state.forward && !state.back) _velocity.z = -1
      if (state.back && !state.forward) _velocity.z = 1
      if (!state.forward && !state.back) _velocity.z = 0
      if (state.run) speed *= 2

      if (_velocity.length) {
        _velocity.applyQuaternion(_quat).normalize()
        entity.sceneObject.position.addScaledVector(_velocity, speed * dl)
        const ll = cartesianToPolar(
          worldPosition
            .copy(entity.sceneObject.position)
            .sub(entity.target.helloPlanet.position),
        )
        entity.long = ll[0]
        entity.lat = ll[1]
        //
        // entity.sceneObject.getWorldPosition(blah)

        // const newLongLat = cartesianToPolar(blah)
        // entity.longLat = newLongLat
        // console.log(entities.length, entity.longLat, newLongLat)
      }
    }
    vec3Pool.release(_velocity)
    vec3Pool.release(targetPosition)
    vec3Pool.release(worldPosition)
    vec3Pool.release(blah)
  })
}

export const GodCameraSingletonSystem: React.FC = () => {
  useGodCamera()
  return null
}
