import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei"
import * as React from "react"

export enum Controls {
  forward = "forward",
  left = "left",
  right = "right",
  back = "back",
  jump = "jump",
  run = "run",
  camera = "camera",
  use = "use",
  special = "special",
}

export const KeyboardController: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const map = React.useMemo<KeyboardControlsEntry[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "w", "W"] },
      { name: Controls.back, keys: ["ArrowDown", "s", "S"] },
      { name: Controls.left, keys: ["ArrowLeft", "a", "A"] },
      { name: Controls.right, keys: ["ArrowRight", "d", "D"] },
      { name: Controls.jump, keys: ["Space", " "] },
      { name: Controls.run, keys: ["Shift", "Control"] },
      { name: Controls.camera, keys: ["C", "c"] },
      { name: Controls.use, keys: ["F", "f"] },
      { name: Controls.special, keys: ["T", "t"] },
    ],
    [],
  )

  return <KeyboardControls map={map}>{children}</KeyboardControls>
}
