import * as React from "react"

export function useScroll(
  domElement: HTMLElement,
  callback: (e: WheelEvent) => void,
) {
  React.useEffect(() => {
    domElement.addEventListener("wheel", callback)
    return () => {
      domElement.removeEventListener("wheel", callback)
    }
  }, [domElement, callback])
}
