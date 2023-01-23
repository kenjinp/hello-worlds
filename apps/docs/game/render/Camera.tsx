import { FlyCamera } from "@game/cameras/FlyCamera"
import { GodCamera } from "@game/cameras/GodCamera"
import { ECS } from "@game/ECS"
import { PerspectiveCamera } from "@react-three/drei"
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

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c") {
        setUseGodCamera(!useGodCamera)
      }
    }
    document.body.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.removeEventListener("keydown", onKeyDown)
    }
  }, [useGodCamera])

  return (
    <>
      {useGodCamera ? <GodCamera /> : <FlyCamera />}
      <CameraEntity />
    </>
  )
}
