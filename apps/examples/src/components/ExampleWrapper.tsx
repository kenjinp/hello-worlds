import { CameraControls } from "@react-three/drei"
import * as React from "react"
import { Color } from "three"

export const windowBounds = "window-bounds"

export const ExampleWrapper: React.FC<
  React.PropsWithChildren<{
    controls: React.ReactNode
  }>
> = ({
  children,
  controls = <CameraControls makeDefault maxZoom={100_000} />,
}) => {
  return (
    <>
      <directionalLight color={new Color("white")} intensity={10} />
      {children}
      {controls}
    </>
  )
}
