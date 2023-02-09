import { useCanvasPointerLock } from "@components/hooks/usePointerLock"
import { ECS, world } from "@game/ECS"
import { AstronomicalObjectProperties } from "@game/Entity"
import { Controls } from "@game/player/KeyboardController"
import { useWatchComponent } from "@game/player/Player"
import { vec3Pool } from "@game/Pools"
import { LatLong, remap } from "@hello-worlds/planets"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useAltitude } from "hooks/useAltitude"
import { useMouseMove } from "hooks/useMouseMove"
import { useScroll } from "hooks/useScroll"
import * as React from "react"
import { Euler, MathUtils, Object3D, Quaternion, Sphere, Vector3 } from "three"

const getZoomScale = (zoomSpeed = 1.0) => {
  return Math.pow(0.95, zoomSpeed)
}
const _PI_2 = Math.PI / 2

const minPolarAngle = 0 // radians
const maxPolarAngle = Math.PI // radians
const pointerSpeed = 0.5 * 0.002
const _quat = new Quaternion()
const _tempQuat = new Quaternion()
const _euler = new Euler(0, 0, 0, "YXZ")
const _tempEuler = new Euler(0, 0, 0, "YXZ")
const _tempLatLong = new LatLong()
const _tempObject = new Object3D()
const _tempSphere = new Sphere()

export function useGodCamera() {
  const [, get] = useKeyboardControls<Controls>()
  const closestAstronomicalObject =
    useWatchComponent<AstronomicalObjectProperties>("closestAstronomicalObject")
  const { isLocked, exitPointerLock } = useCanvasPointerLock()
  const {
    camera,
    scene,
    gl: { domElement },
  } = useThree()
  const entity = ECS.useCurrentEntity()
  const { getExactAltitude } = useAltitude(entity.sceneObject)
  const target = useWatchComponent<AstronomicalObjectProperties>("target")

  React.useEffect(() => {
    if (!closestAstronomicalObject) return
    if (!target) {
      world.addComponent(entity, "target", closestAstronomicalObject)
      camera.lookAt(closestAstronomicalObject.helloPlanet.position)
    }
  }, [target, closestAstronomicalObject])

  // exit pointer Lock when we get out of this camera mode :)
  React.useEffect(() => {
    entity.sceneObject.position.copy(camera.position)
    return () => {
      exitPointerLock()
    }
  }, [entity, camera])

  const mouseMoveCallback = React.useCallback(
    (e: MouseEvent) => {
      if (isLocked === false) return
      if (!target) return

      // should copy current camera position
      // so when you click it doesn't bounce around
      const movementX = e.movementX || 0
      const movementY = e.movementY || 0

      // This tempEuler has the orientation pointing from center of planet to camera
      _tempEuler.setFromQuaternion(_tempObject.quaternion)

      // // this is the direction of the camera
      _euler.setFromQuaternion(camera.quaternion)

      const my = -movementX * pointerSpeed
      const mx = -movementY * pointerSpeed

      _euler.x += mx
      _euler.y += my

      // _euler.z += my

      // }

      const newRotation = camera.rotation.x + mx
      if (newRotation > 0) {
        camera.rotation.x += mx
      }

      console.log(_euler.x, _tempEuler.x)

      // const tempMaxX = Math.max(
      //   _PI_2 - maxPolarAngle,
      //   Math.min(_PI_2 - minPolarAngle, _tempEuler.x),
      // )

      // if (
      //   _PI_2 - maxPolarAngle > _tempEuler.x &&
      //   _tempEuler.x > _PI_2 - minPolarAngle
      // ) {
      //   _euler.x += mx
      // }
      // _euler.y += my
      // console.log(_tempEuler.x, tempMaxX)

      // _tempObject.quaternion.setFromEuler(_euler)
      // _tempObject.getWorldQuaternion(_quat)
      camera.setRotationFromEuler(_euler)
    },
    [isLocked, target],
  )

  useMouseMove(domElement, mouseMoveCallback)

  useScroll(domElement, e => {
    const delta = e.deltaY
    const target = entity.target
    const minAltitude = target.radius
    const maxAltitude = target.radius * 5
    const currentAltitude = remap(entity.scale, 0, 1, minAltitude, maxAltitude)

    let speed = 1
    let scale = remap(currentAltitude, minAltitude, maxAltitude, 0, 1)
    if (delta > 0) {
      scale /= getZoomScale(speed)
    } else {
      scale *= getZoomScale(speed)
    }

    scale = MathUtils.clamp(scale, 0, 1)
    entity.scale = scale
  })

  // Thi is where we set our initial camera positions
  React.useEffect(() => {
    const alt = getExactAltitude()

    // Fix initialization of camera
    if (alt < entity.closestAstronomicalObject?.radius) {
      const ll = new LatLong()
      const pos = ll.toCartesian(
        entity.closestAstronomicalObject?.radius * 5,
        new Vector3(),
      )
      entity.sceneObject.position.set(pos.x, pos.y, pos.z)
    }
  }, [closestAstronomicalObject])

  useFrame((_s, dl) => {
    camera.getWorldQuaternion(_quat)
    const lookAtDirection = vec3Pool.get()
    const targetPosition = vec3Pool.get()
    const latLongPosition = vec3Pool.get()
    const _velocity = vec3Pool.get()
    const state = get()
    const target = entity.target
    if (!target) {
      return
    }

    const minAltitude = target.radius
    const maxAltitude = target.radius * 5
    const currentAltitude = remap(entity.scale, 0, 1, minAltitude, maxAltitude)

    _tempSphere.set(target.helloPlanet.position, currentAltitude)

    LatLong.cartesianToLatLong(entity.sceneObject.position, _tempLatLong)
      .toCartesian(currentAltitude, latLongPosition)
      .add(target.helloPlanet.position)

    // _tempSphere.clampPoint(entity.sceneObject.position, latLongPosition)

    entity.sceneObject.position.copy(latLongPosition)

    // Set Camera Rotation
    camera.getWorldDirection(lookAtDirection)

    const targetDirection = vec3Pool
      .get()
      .copy(target.helloPlanet.position)
      .sub(entity.sceneObject.position)

    const up = targetDirection.clone().normalize()
    _tempObject.position.copy(entity.sceneObject.position)
    _tempObject.lookAt(up)
    _tempObject.rotateX(-_PI_2)
    // _tempObject.getWorldQuaternion(_quat)

    // Zooming Movement Stuff
    const minSpeed = 5
    const maxSpeed = 100_000_000
    let speed = remap(entity.scale, 0, 1, minSpeed, maxSpeed)
    _velocity.set(0, 0, 0)

    if (state.left && !state.right) _velocity.x = -1
    if (state.right && !state.left) _velocity.x = 1
    if (!state.left && !state.right) _velocity.x = 0

    if (state.forward && !state.back) _velocity.z = -1
    if (state.back && !state.forward) _velocity.z = 1
    if (!state.forward && !state.back) _velocity.z = 0
    if (state.run) speed *= 2

    _velocity.applyQuaternion(_quat)

    if (_velocity.length()) {
      entity.sceneObject.position.addScaledVector(_velocity, speed * dl)

      // Make sure that the position is on the surface of the sphere
      // Where the sphere radius is the target height
      _tempSphere.clampPoint(
        entity.sceneObject.position,
        entity.sceneObject.position,
      )
      // clampPointToSphereSurface(
      //   entity.sceneObject.position,
      //   _tempSphere.center,
      //   _tempSphere.radius,
      // )
    }
    vec3Pool.release(_velocity)
    vec3Pool.release(targetPosition)
    vec3Pool.release(latLongPosition)
    vec3Pool.release(lookAtDirection)
    vec3Pool.release(targetDirection)
  })
}

export const GodCameraSingletonSystem: React.FC = () => {
  useGodCamera()
  return null
}
