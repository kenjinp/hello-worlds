import { ECS } from "@game/ECS"
import { C } from "@game/Math"
import { Controls } from "@game/player/KeyboardController"
import { useWatchComponent } from "@game/player/Player"
import { LerpDuration } from "@game/utils/LerpDuration"
import { LatLong } from "@hello-worlds/planets"
import { FlyControls, useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useAltitude } from "hooks/useAltitude"
import * as React from "react"
import { MathUtils, Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"

export function useFlyCameraSystem() {
  const camera = useThree(s => s.camera)
  const lerpDuration = React.useRef(new LerpDuration())
  const entity = ECS.useCurrentEntity()
  const [sub, get] = useKeyboardControls<Controls>()
  const closestAstronomicalObject = useWatchComponent(
    "closestAstronomicalObject",
  )

  const { getExactAltitude } = useAltitude(camera)

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
    const lerpy = lerpDuration.current
    const keyboardState = get()
    const speedBoost = keyboardState.run
    const speedModifier = speedBoost ? 2 : 1
    const alt = getExactAltitude()

    const flyControls = entity.sceneObject as unknown as FlyControlsImpl

    const isMoving = !!(
      Object.values(flyControls.moveState).reduce(
        (memo, entry) => memo || entry,
        0,
      ) || flyControls.autoForward
    )

    if (lerpy.lastValue !== isMoving) {
      lerpy.reset()
    }

    // apply speed to fly camera controls based on distance to ground
    entity.targetSpeed = isMoving
      ? MathUtils.clamp(
          Math.abs(alt * speedModifier),
          entity.minSpeed,
          entity.maxSpeed,
        )
      : 0

    const currentMovement = flyControls.movementSpeed || 0

    const lerpedMovementSpeed = lerpy.lerp(currentMovement, entity.targetSpeed)
    flyControls.movementSpeed = lerpedMovementSpeed

    flyControls.rollSpeed = entity.rollSpeed
    entity.sceneObject.position.copy(camera.position)
    lerpy.lastValue = isMoving
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
