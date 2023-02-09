import { Controls } from "@game/player/KeyboardController"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEntities } from "miniplex/react"
import { Quaternion } from "three"
import { archetypes } from "../Entity"
import { vec3Pool } from "../Pools"

const _quat = new Quaternion()
export function useFly() {
  const { entities } = useEntities(archetypes.flyable)
  const camera = useThree(s => s.camera)
  const [, get] = useKeyboardControls<Controls>()

  useFrame((_s, dl) => {
    const t = vec3Pool.get()
    camera.getWorldDirection(t)

    camera.getWorldQuaternion(_quat)
    const state = get()
    for (const entity of entities) {
      const speed = 100
      const runMultiplier = 2
      const _velocity = vec3Pool.get()

      if (state.left && !state.right) _velocity.x = -1
      if (state.right && !state.left) _velocity.x = 1
      if (!state.left && !state.right) _velocity.x = 0

      if (state.forward && !state.back) _velocity.z = -1
      if (state.back && !state.forward) _velocity.z = 1
      if (!state.forward && !state.back) _velocity.z = 0
      // if (state.run) _velocity.multiplyScalar(runMultiplier)
      _velocity.applyQuaternion(_quat)

      // entity.sceneObject.quaternion.copy(camera.quaternion)
      entity.sceneObject.position.addScaledVector(_velocity, speed * dl)
      vec3Pool.release(_velocity)
    }
    vec3Pool.release(t)
  })
}
