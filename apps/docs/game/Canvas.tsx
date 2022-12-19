import * as React from "react"
import * as RC from "render-composer"

export const Canvas: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties }>
> = ({ children, style }) => {
  return (
    <RC.Canvas
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
      style={style || { position: "absolute", top: 0, left: 0, zIndex: 1 }}
    >
      <React.Suspense fallback={null}>{children}</React.Suspense>
    </RC.Canvas>
  )
}
