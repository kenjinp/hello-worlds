import { ECS } from "@game/ECS"
import { C } from "@game/Math"
import { Controls } from "@game/player/KeyboardController"
import { useWatchComponent } from "@game/player/Player"
import { LatLong, Planet, RingWorld, WORLD_TYPES } from "@hello-worlds/planets"
import { FlyControls, useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { MathUtils, Object3D, Raycaster, Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"
import { match } from "ts-pattern"

// TODO put into Math utils of the hello worlds library
const getApproximateAltitudeOfSpheroid = (
  object: Object3D,
  helloPlanet: Planet | RingWorld,
) => {
  return (
    object.position.distanceTo(helloPlanet.position) - helloPlanet.radius || 0
  )
}

// const getApproximateAltitudeOfRing = (object: Object3D, helloRingWorld: RingWorld) => {

// }

// const getApproximateAltitudeOfFlatWorld = (object3D: Object3D, helloFlatWorld: FlatWorld) => {
//   // distance to XZ plane

// }

const raycaster = new Raycaster()

export function useFlyCameraSystem() {
  const camera = useThree(s => s.camera)
  const entity = ECS.useCurrentEntity()
  const [sub, get] = useKeyboardControls<Controls>()
  const closestAstronomicalObject = useWatchComponent(
    "closestAstronomicalObject",
  )

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

    return _getAltitude(camera, closestAstroObject.helloPlanet)
  }

  const getExactAltitude = () => {
    const closestAstroObject = entity.closestAstronomicalObject
    if (!closestAstroObject) {
      return Infinity
    }
    const dir = closestAstroObject.position.sub(camera.position).normalize()
    raycaster.set(camera.position, dir)
    const hit = raycaster.intersectObject(closestAstroObject.helloPlanet, true)
    const firstHit = hit[0]
    if (firstHit) {
      return firstHit.distance
    }
    return getApproximateAltitude()
  }

  React.useEffect(() => {
    const alt = getExactAltitude()

    // Fix initialization of camera
    if (alt < entity.closestAstronomicalObject?.radius) {
      const ll = new LatLong()
      const pos = ll.toCartesian(
        entity.closestAstronomicalObject?.radius * 5,
        new Vector3(),
      )
      camera.position.set(pos.x, pos.y, pos.z)
    }
  }, [closestAstronomicalObject])

  React.useEffect(() => {
    return sub(
      state => state.jump,
      pressed => {
        const flyControls = entity.sceneObject as unknown as FlyControlsImpl
        if (pressed) {
          flyControls.autoForward = !flyControls.autoForward
        }
      },
    )
  }, [entity])

  useFrame((_s, dl) => {
    const keyboardState = get()
    const speedBoost = keyboardState.run
    const speedModifier = speedBoost ? 2 : 1
    const alt = getExactAltitude()

    const flyControls = entity.sceneObject as unknown as FlyControlsImpl

    const isMoving =
      Object.values(flyControls.moveState).reduce(
        (memo, entry) => memo || entry,
        0,
      ) || flyControls.autoForward

    // apply speed to fly camera controls based on distance to ground
    entity.targetSpeed = !!isMoving
      ? MathUtils.clamp(
          Math.abs(alt * speedModifier),
          entity.minSpeed,
          entity.maxSpeed,
        )
      : 0

    const currentMovement = flyControls.movementSpeed || 0

    flyControls.movementSpeed = MathUtils.lerp(
      currentMovement,
      entity.targetSpeed,
      0.1,
    )

    flyControls.rollSpeed = entity.rollSpeed
    entity.sceneObject.position.copy(camera.position)
  })
}

export const FlyCameraSingletonSystem: React.FC = () => {
  useFlyCameraSystem()
  return null
}

export const FlyCamera: React.FC<React.PropsWithChildren<{}>> = ({}) => {
  const camera = useThree(s => s.camera)
  return (
    <>
      <ECS.Entity>
        <FlyCameraSingletonSystem />
        <ECS.Component name="isFlyCameraTarget" data={true} />
        <ECS.Component name="minSpeed" data={2} />
        <ECS.Component name="maxSpeed" data={C} />
        <ECS.Component name="rollSpeed" data={0.25} />
        <ECS.Component name="fullStopTimer" data={0} />
        <ECS.Component name="targetSpeed" data={0} />
        <ECS.Component name="sceneObject">
          <FlyControls position={camera.position} dragToLook />
        </ECS.Component>
        <ECS.Component name="closestAstronomicalObject" data={null} />
      </ECS.Entity>
    </>
  )
}
