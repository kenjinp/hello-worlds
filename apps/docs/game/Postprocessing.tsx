import { useTexture } from "@react-three/drei"
import * as React from "react"
import * as RC from "render-composer"

export const PostProcessing: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <RC.RenderPipeline>
      <RC.EffectPass>
        <RC.SMAAEffect />
        <RC.SelectiveBloomEffect intensity={5} luminanceThreshold={0.8} />
        <RC.VignetteEffect />
        <RC.LensDirtEffect
          texture={useTexture("/img/effects/lensdirt.jpg")}
          strength={0.025}
        />
        <React.Suspense fallback={null}>{children}</React.Suspense>
      </RC.EffectPass>
    </RC.RenderPipeline>
  )
}
