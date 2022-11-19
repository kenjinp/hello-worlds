import { Perf } from "r3f-perf"
import * as React from "react"
import * as RC from "render-composer"
import { useStore } from "statery"
import { AU } from "./WorldBuilder.math"
import { store } from "./WorldBuilder.state"

export const Canvas: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { debugMode } = useStore(store)
  return (
    <RC.Canvas
      gl={{
        logarithmicDepthBuffer: true,
        antialias: false,
        stencil: false,
        depth: false,
      }}
      camera={{
        near: 0.01,
        far: AU,

        // Number.MAX_SAFE_INTEGER,
      }}
      shadows
      style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
    >
      {debugMode && <Perf style={{ right: "10vw" }} />}
      <React.Suspense fallback={null}>{children}</React.Suspense>
    </RC.Canvas>
  )
}
