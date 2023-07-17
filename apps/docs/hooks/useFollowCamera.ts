import { Controls } from "@game/player/KeyboardController"
import { useKeyboardControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { AxesHelper, Euler, Object3D, Vector3 } from "three"

const cameraOffset = new Vector3(0, 1, -5)
export default function useFollowCamera() {
  const { scene, camera } = useThree()
  const [subscribeKeys] = useKeyboardControls()
  const frameOffset = 0.002
  const pivot = useMemo(() => {
    const o = new Object3D()
    o.name = "pivot wrapper"
    return o
  }, [])
  const followCam = useMemo(() => {
    const o = new Object3D()
    o.name = "followCam wrapper"
    o.position.copy(cameraOffset)
    return o
  }, [])
  const rotation = useMemo(() => {
    const o = new Object3D()
    o.name = "rotation wrapper"
    // -Math.PI / 2
    o.rotation.copy(new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0)))
    return o
  }, [])

  useEffect(() => {
    return subscribeKeys(
      state => state[Controls.right],
      pressed => {
        rotation.rotation.y += 0.01
      },
    )
  }, [rotation])

  const onDocumentMouseMove = e => {
    if (document.pointerLockElement) {
      rotation.rotation.y -= e.movementX * frameOffset
      const v = followCam.rotation.x + e.movementY * frameOffset

      if (v >= -0.35 && v <= 0.8) {
        followCam.rotation.x = v
        followCam.position.y = -v * followCam.position.z + 1
      }
    }
    return false
  }

  const onDocumentMouseWheel = e => {
    if (document.pointerLockElement) {
      const v = followCam.position.z + e.deltaY * frameOffset

      if (v >= -7 && v <= -2) {
        followCam.position.z = v
      }
    }
    return false
  }

  useEffect(() => {
    followCam.add(camera)
    rotation.add(followCam)
    const direction = new Vector3()
    pivot.getWorldDirection(direction)
    const helper = new AxesHelper(20)
    pivot.add(rotation)
    pivot.add(helper)
    console.log({ camera })
    // camera.updateMatrixWorld(true)
    // scene.add(pivot)
    document.addEventListener("mousemove", onDocumentMouseMove)
    document.addEventListener("mousewheel", onDocumentMouseWheel)
    return () => {
      followCam.remove(camera)
      followCam.remove(pivot)
      pivot.remove(helper)
      pivot.remove(rotation)
      // followCam.remove(rotation)
      document.removeEventListener("mousemove", onDocumentMouseMove)
      document.removeEventListener("mousewheel", onDocumentMouseWheel)
    }
  })

  return { pivot, rotation, followCam }
}
