import { Perf } from "r3f-perf"
import * as React from "react"
import * as RC from "render-composer"
import { useStore } from "statery"
import { store } from "./WorldBuilder.state"

export const Canvas: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { debugMode } = useStore(store)
  return (
    <RC.Canvas
      gl={{ logarithmicDepthBuffer: true }}
      camera={{
        near: 0.01,
        far: Number.MAX_SAFE_INTEGER,
      }}
      shadows
      style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
    >
      {debugMode && <Perf style={{ right: "10vw" }} />}
      <React.Suspense fallback={null}>{children}</React.Suspense>
    </RC.Canvas>
  )
}
