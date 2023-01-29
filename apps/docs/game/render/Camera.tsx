import { FlyCamera } from "@game/cameras/FlyCamera"
import { GodCamera } from "@game/cameras/GodCamera/GodCamera.entity"
import { ECS } from "@game/ECS"
import { Controls } from "@game/player/KeyboardController"
import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei"
import * as React from "react"

export function CameraEntity() {
  return (
    <ECS.Entity>
      <ECS.Component name="isCamera" data={true} />
      <ECS.Component name="sceneObject">
        <PerspectiveCamera name="CameraEntity"></PerspectiveCamera>
      </ECS.Component>
    </ECS.Entity>
  )
}

export function AllCameras() {
  const [useGodCamera, setUseGodCamera] = React.useState(false)
  const [sub] = useKeyboardControls<Controls>()

  React.useEffect(() => {
    return sub(
      state => state.camera,
      pressed => {
        if (pressed) {
          setUseGodCamera(!useGodCamera)
        }
      },
    )
  }, [useGodCamera])

  return (
    <>
      {useGodCamera ? <GodCamera /> : <FlyCamera />}
      <CameraEntity />
    </>
  )
}
