import { SafeHydrate } from "@components/safe-render/SafeRender"
import { Canvas as R3fCanvas } from "@react-three/fiber"
import * as React from "react"
import * as RC from "render-composer"
import { Vector3 } from "three"
import { AU } from "./Math"

export const Canvas: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties }>
> = ({ children, style }) => {
  return (
    <SafeHydrate>
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
        flat
      >
        <React.Suspense fallback={null}>{children}</React.Suspense>
      </RC.Canvas>
    </SafeHydrate>
  )
}

export const NormalCanvas: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties }>
> = ({ children, style }) => {
  return (
    <SafeHydrate>
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
          position: new Vector3(1, 1, 1).multiplyScalar(AU),
        }}
        shadows
        style={style || { position: "absolute", top: 0, left: 0, zIndex: 1 }}
      >
        <React.Suspense fallback={null}>{children}</React.Suspense>
      </R3fCanvas>
    </SafeHydrate>
  )
}
