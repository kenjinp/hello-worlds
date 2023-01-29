import * as React from "react"

export function useMouseMove(
  domElement: HTMLElement,
  callback: (e: MouseEvent) => void,
) {
  React.useEffect(() => {
    domElement.addEventListener("mousemove", callback)
    return () => {
      domElement.removeEventListener("mousemove", callback)
    }
  }, [domElement, callback])
}
