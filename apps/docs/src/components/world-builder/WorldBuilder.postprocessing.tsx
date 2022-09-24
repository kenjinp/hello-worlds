import { useTexture } from "@react-three/drei"
import * as React from "react"
import * as RC from "render-composer"
import { ECS } from "./WorldBuilder.state"

export const PostProcessing: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { entities: stars } = ECS.useArchetype("star")
  return (
    <RC.RenderPipeline>
      <RC.EffectPass>
        <RC.SMAAEffect />
        <RC.SelectiveBloomEffect intensity={5} luminanceThreshold={0.9} />
        <ECS.Entities entities={stars}>
          {entity => {
            return entity.mesh && <RC.GodRaysEffect lightSource={entity.mesh} />
          }}
        </ECS.Entities>
        <RC.VignetteEffect />
        <RC.LensDirtEffect
          texture={useTexture("/img/lensdirt.jpg")}
          strength={0.1}
        />
        <React.Suspense fallback={null}>{children}</React.Suspense>
      </RC.EffectPass>
    </RC.RenderPipeline>
  )
}
