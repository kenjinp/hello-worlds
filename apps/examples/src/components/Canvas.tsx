import { Canvas as R3fCanvas } from "@react-three/fiber"
import { Suspense } from "react"

export const Canvas: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties }>
> = ({ children, style }) => {
  return (
    <R3fCanvas
      gl={{
        logarithmicDepthBuffer: true,
        antialias: false,
        stencil: false,
        depth: true,
      }}
      camera={{
        near: 0.01,
        far: Number.MAX_SAFE_INTEGER,
      }}
      shadows
      style={
        style || {
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          background: "pink",
        }
      }
    >
      <Suspense fallback={null}>{children}</Suspense>
    </R3fCanvas>
  )
}
