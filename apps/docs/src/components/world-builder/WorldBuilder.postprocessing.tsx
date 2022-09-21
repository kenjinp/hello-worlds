import { useTexture } from "@react-three/drei";
import * as React from "react";
import * as RC from "render-composer";
import { ECS } from "./WorldBuilder.state";

export const PostProcessing: React.FC = () => {
  return (
    <RC.RenderPipeline>
      <RC.EffectPass>
        {/* <RC.SMAAEffect /> */}
        <RC.SelectiveBloomEffect intensity={5} luminanceThreshold={0.9} />
        <ECS.ManagedEntities tag="star">
          {(entity) => {
            return entity.mesh && <RC.GodRaysEffect lightSource={entity.mesh} />
          }}
        </ECS.ManagedEntities>
        <RC.VignetteEffect />
        <RC.LensDirtEffect texture={useTexture("/img/lensdirt.jpg")} strength={0.1}/>
      </RC.EffectPass>
    </RC.RenderPipeline>
  )
};
