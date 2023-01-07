import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Quaternion } from "three"
import { PointerLockControls as PLC } from "./PointerLockCameraImpl"

export const PointerLockCamera: React.FC<{ up: Quaternion }> = ({ up }) => {
  const camera = useThree(state => state.camera)
  const domElement = useThree(state => state.gl.domElement)

  const plc = React.useMemo(
    () => new PLC(camera, domElement),
    [camera, domElement],
  )

  React.useEffect(() => {
    plc.connect()
    const listener = _ => {
      if (plc.isLocked) return
      domElement.requestPointerLock()
    }
    domElement.addEventListener("click", listener)
    return () => {
      plc.dispose()
      domElement.removeEventListener("click", listener)
    }
  }, [plc])

  React.useEffect(() => {
    console.log("oh no")
    plc.up = up
  }, [up, plc])

  return null
}
