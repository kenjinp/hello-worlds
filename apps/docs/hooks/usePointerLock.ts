import * as React from "react"

export function usePointerLock(canvas: HTMLCanvasElement | null): {
  locked: boolean
  requestPointerLock: () => void
} {
  const [locked, setLocked] = React.useState(false)
  const handleLockChange = React.useCallback(() => {
    setLocked(document.pointerLockElement === canvas)
  }, [canvas])

  React.useEffect(() => {
    if ("onpointerlockchange" in document) {
      document.addEventListener("pointerlockchange", handleLockChange)
    }
    return () => {
      document.removeEventListener("pointerlockchange", handleLockChange)
    }
  }, [canvas, handleLockChange])

  const requestPointerLock = () => {
    if (!locked) {
      canvas?.requestPointerLock()
    } else {
      console.warn("requested pointer lock but the screen was not locked")
    }
  }

  return {
    locked,
    requestPointerLock,
  }
}
