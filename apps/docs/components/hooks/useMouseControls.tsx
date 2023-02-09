import { useThree } from "@react-three/fiber"
import * as React from "react"

export function useCanvasMouseControls() {
  const [mouseMap] = React.useState(new Map<number, boolean>())
  const domElement = useThree(state => state.gl.domElement)

  React.useEffect(() => {
    const mouseUp = (e: MouseEvent) => {
      mouseMap.set(e.button, true)
    }
    const mouseDown = (e: MouseEvent) => {
      mouseMap.set(e.button, false)
    }
    domElement.addEventListener("mouseup", mouseUp)
    domElement.addEventListener("mousedown", mouseDown)
    return () => {
      domElement.removeEventListener("mouseup", mouseUp)
      domElement.removeEventListener("mousedown", mouseDown)
    }
  }, [domElement, mouseMap])

  const getMouseValue = (button: number) => {
    return mouseMap.get(button) || false
  }

  return {
    getMouseValue,
  }
}
