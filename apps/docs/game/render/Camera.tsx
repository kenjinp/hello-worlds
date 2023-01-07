import { ECS } from "@game/ECS"
import { PerspectiveCamera } from "@react-three/drei"

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
