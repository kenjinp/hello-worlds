import { useThree } from "@react-three/fiber"
import * as React from "react"

// Requests pointer lock on canvas click
export function useCanvasPointerLock() {
  const [isLocked, setLisLocked] = React.useState(false)
  const domElement = useThree(state => state.gl.domElement)

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

  const exitPointerLock = () => {
    document.exitPointerLock()
  }

  return {
    isLocked,
    exitPointerLock,
  }
}
