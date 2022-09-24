import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Vector2 } from "three"

export function useControls() {
  const [mouseXY] = React.useState(new Vector2(0, 0))
  const scroll = React.useRef(0)
  const {
    gl: { domElement: canvas },
  } = useThree()
  const [keyMap] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    const mouseEvent = (e: MouseEvent) => {
      mouseXY.set(e.movementX, e.movementY)
    }

    const requestPointerLock = () => {
      canvas.requestPointerLock()
    }

    const scrollEvent = (e: WheelEvent) => {
      scroll.current = e.deltaY > 0 ? 1 : -1
    }

    const keyDown = (e: KeyboardEvent) => {
      Object.keys(keyMap).forEach(key => {
        if (key !== e.key) {
          keyMap[key] = false
        }
      })
      keyMap[e.key] = true
    }

    // canvas.addEventListener('click', requestPointerLock);
    document.addEventListener("wheel", scrollEvent)
    document.addEventListener("mousemove", mouseEvent)
    document.addEventListener("keydown", keyDown)

    return () => {
      // document.removeEventListener('mousemove', mouseEvent);
      canvas.removeEventListener("click", requestPointerLock)
      document.removeEventListener("wheel", scrollEvent)
      document.addEventListener("keydown", keyDown)
    }
  }, [])

  return {
    mouse: {
      move: () => {
        return mouseXY
      },
      scroll: () => {
        return scroll.current
      },
      isPointerLocked: () => {
        return document.pointerLockElement === canvas
      },
    },
    keyboard: {
      queryPressed: () => {
        return keyMap
      },
    },
  }
}
