import * as React from 'react';
import * as RC from "render-composer";

export const Canvas: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
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
      <React.Suspense fallback={null}>
        <RC.RenderPipeline>
        {children}
        </RC.RenderPipeline>
      </React.Suspense>
    </RC.Canvas>
  );
};