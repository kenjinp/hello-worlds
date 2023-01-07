import { PointerLockCamera } from "@components/pointer-lock-camera/PointerLockCamera"
import { LatLong, polarToCartesian } from "@examples/tectonics/voronoi/math"
import { ECS, world } from "@game/ECS"
import { archetypes } from "@game/Entity"
import { Controls } from "@game/player/KeyboardController"
import { vec3Pool } from "@game/Pools"
import { remap } from "@hello-worlds/planets"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Euler, MathUtils, Object3D } from "three"

const getZoomScale = (zoomSpeed = 1.0) => {
  return Math.pow(0.95, zoomSpeed)
}
const _PI_2 = Math.PI / 2

const minPolarAngle = 0 // radians
const maxPolarAngle = Math.PI // radians
const pointerSpeed = 0.5

// God Camera System
export function useGodCamera() {
  const { entities } = useEntities(archetypes.godCamera)
  const camera = useThree(s => s.camera)
  const domElement = useThree(state => state.gl.domElement)
  const scene = useThree(state => state.scene)
  const [, get] = useKeyboardControls<Controls>()
  const _euler = new Euler(0, 0, 0, "YXZ")
  const [isLocked, setLisLocked] = React.useState(false)

  React.useEffect(() => {
    const lockChange = () => {
      if (isLocked) return
      domElement.requestPointerLock()
    }
    domElement.addEventListener("click", lockChange)
    return () => {
      domElement.removeEventListener("click", lockChange)
    }
  }, [isLocked])

  React.useEffect(() => {
    const onPointerLockChange = () => {
      setLisLocked(document.pointerLockElement === domElement)
    }
    document.addEventListener("pointerlockchange", onPointerLockChange)
    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange)
    }
  }, [domElement])

  React.useEffect(() => {
    const referenceObject = new Object3D()
    const childReferenceObject = new Object3D()
    referenceObject.add(childReferenceObject)
    scene.add(referenceObject)
    const scrollWheelListener = (e: WheelEvent) => {
      const delta = e.deltaY
      for (const entity of entities) {
        const target = entity.target
        const currentAltitude = entity.altitude
        const minAltitude = target.radius
        const maxAltitude = target.radius * 5

        let speed = 1
        let scale = remap(currentAltitude, minAltitude, maxAltitude, 0, 1)
        if (delta > 0) {
          scale /= getZoomScale(speed)
        } else {
          scale *= getZoomScale(speed)
        }

        scale = MathUtils.clamp(scale, 0, 1)

        const newAltitude = remap(scale, 0, 1, minAltitude, maxAltitude)
        entity.altitude = newAltitude
        console.log("newAltitude", newAltitude, delta, speed, scale)
      }
    }

    const mouseMoveListener = (e: MouseEvent) => {
      console.log("wheee", isLocked)
      if (isLocked === false) return
      for (const entity of entities) {
        const targetDirection = vec3Pool
          .get()
          .copy(entity.target.position)
          .sub(entity.sceneObject.position)

        const up = targetDirection.clone().normalize()

        const rotation = new Object3D()
        rotation.lookAt(up)
        rotation.rotateX(-Math.PI / 2)

        const quat = rotation.quaternion
        referenceObject.quaternion.copy(quat)

        const movementX = e.movementX || 0
        const movementY = e.movementY || 0

        _euler.setFromQuaternion(childReferenceObject.quaternion)

        _euler.y -= movementX * 0.002 * pointerSpeed
        _euler.x -= movementY * 0.002 * pointerSpeed

        _euler.x = Math.max(
          _PI_2 - maxPolarAngle,
          Math.min(_PI_2 - minPolarAngle, _euler.x),
        )

        childReferenceObject.quaternion.setFromEuler(_euler)
        childReferenceObject.getWorldQuaternion(quat)
        camera.quaternion.copy(quat)
        vec3Pool.release(targetDirection)
      }
    }

    window.addEventListener("mousemove", mouseMoveListener)
    window.addEventListener("wheel", scrollWheelListener)
    return () => {
      window.removeEventListener("mousemove", mouseMoveListener)
      window.removeEventListener("wheel", scrollWheelListener)
      scene.remove(childReferenceObject)
    }
  }, [isLocked])

  useFrame((_s, dl) => {
    const targetPosition = vec3Pool.get()

    for (const entity of entities) {
      const latLongPosition = polarToCartesian(
        entity.latLong[0],
        entity.latLong[1],
        entity.target.radius,
      ).sub(entity.target.position)
      targetPosition
        .copy(entity.target.position)
        .sub(latLongPosition)
        .normalize()
        .multiplyScalar(entity.altitude)
      entity.sceneObject.position.copy(targetPosition)
      // camera.lookAt(entity.target.position)
    }
    vec3Pool.release(targetPosition)
  })
}

// Maybe this should just go in the system bro
const InitializeTargetPosition: React.FC = () => {
  const entity = ECS.useCurrentEntity()
  // This is to set up the initial position of the target
  const upQuaternion = React.useMemo(() => {
    console.log(entity)
    const { target, latLong, altitude, sceneObject } = entity
    if (!latLong || !target || !altitude || !sceneObject) {
      world.update(entity)
      return
    }

    // Set Initial position to latLong at a certain altitude from the planet
    // position on surface of planet
    const latLongPosition = polarToCartesian(
      latLong[0],
      latLong[1],
      target.radius,
    ).sub(target.position)

    const targetDirection = vec3Pool
      .get()
      .copy(target.position)
      .sub(latLongPosition)

    const up = targetDirection.clone().normalize()

    const targetPosition = targetDirection.normalize().multiplyScalar(altitude)

    sceneObject.position.copy(targetPosition)

    const rotation = new Object3D()
    rotation.lookAt(up)
    rotation.rotateX(Math.PI / 2)

    vec3Pool.release(targetPosition)

    return rotation.quaternion
  }, [
    entity,
    entity.target,
    entity.altitude,
    entity.latLong,
    entity.sceneObject,
  ])

  console.log("hello upQuaternion", upQuaternion)

  return <>{upQuaternion && <PointerLockCamera up={upQuaternion} />}</>
}

export const GodCamera: React.FC<
  React.PropsWithChildren<{ initialLatLong: LatLong }>
> = ({ initialLatLong }) => {
  const entity = ECS.useCurrentEntity()
  const initialAltitude = entity.radius * 2
  useGodCamera()

  // console.log({ initialLatLong })

  // const latLongPosition = polarToCartesian(
  //   initialLatLong[0],
  //   initialLatLong[1],
  //   entity.radius,
  // ).sub(entity.position)

  // const targetDirection = vec3Pool
  //   .get()
  //   .copy(entity.position)
  //   .sub(latLongPosition)

  // const up = targetDirection.clone().normalize()

  // const targetPosition = targetDirection
  //   .normalize()
  //   .multiplyScalar(initialAltitude)

  // // sceneObject.position.copy(targetPosition)

  // const rotation = new Object3D()
  // rotation.lookAt(up)
  // rotation.rotateX(Math.PI / 2)

  return (
    <>
      <ECS.Entity>
        <ECS.Component name="isGodCameraTarget" data={true} />
        <ECS.Component name="latLong" data={initialLatLong} />
        <ECS.Component name="target" data={entity} />
        <ECS.Component name="cameraFollow" data={true} />
        <ECS.Component name="altitude" data={initialAltitude} />
        <ECS.Component name="sceneObject">
          <object3D name="godCameraTarget">
            {/* <PointerLockCamera up={rotation.quaternion} /> */}
            {/* <InitializeTargetPosition /> */}
          </object3D>
        </ECS.Component>
      </ECS.Entity>
    </>
  )
}
