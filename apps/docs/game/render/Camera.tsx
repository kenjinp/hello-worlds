import { ECS } from "@game/ECS"
import { PerspectiveCamera } from "@react-three/drei"

export function CameraEntity() {
  return (
    <ECS.Entity>
      <ECS.Component name="isCamera" data={true} />
      <ECS.Component name="sceneObject">
        <PerspectiveCamera name="CameraEntity" />
      </ECS.Component>
    </ECS.Entity>
  )
}

export function GodCamera() {
  return (
    <ECS.Entity>
      <ECS.Component name="isGodCamera" data={true} />
      <ECS.Component name="sceneObject">
        <object3D name="godCameraTarget" />
      </ECS.Component>
    </ECS.Entity>
  )
}

// export function FlyCamera () {
//   return (
//     <ECS.Entity>
//       <ECS.Component name="isFlyCamera" data={true} />
//       <ECS.Component name="sceneObject">
//        <FlyControls rollSpeed={0.25} />
//       </ECS.Component>
//     </ECS.Entity>
//   )
// }
