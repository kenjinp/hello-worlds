import { ECS } from "@game/ECS"
import * as React from "react"
import { GodCameraSingletonSystem } from "./GodCamera.system"

export const GodCamera: React.FC<React.PropsWithChildren<{}>> = () => {
  return (
    <>
      <ECS.Entity>
        <ECS.Component name="isGodCameraTarget" data={true} />
        <ECS.Component name="cameraFollow" data={true} />
        <ECS.Component name="scale" data={0.5} />
        <ECS.Component name="closestAstronomicalObject" data={null} />
        <ECS.Component name="sceneObject">
          <object3D name="godCameraTarget"></object3D>
        </ECS.Component>
        <GodCameraSingletonSystem />
      </ECS.Entity>
    </>
  )
}
