import { CameraControls } from "@react-three/drei"
import * as React from "react"

export const windowBounds = "window-bounds"

export const ExampleWrapper: React.FC<
  React.PropsWithChildren<{
    controls?: React.ReactNode
  }>
> = ({
  children,
  controls = <CameraControls makeDefault maxZoom={100_000} />,
}) => {
  return (
    <>
      <directionalLight intensity={2} />
      {children}
      {controls}
    </>
  )
}
