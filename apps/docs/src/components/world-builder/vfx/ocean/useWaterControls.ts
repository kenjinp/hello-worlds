import React from "react";

// @ts-ignore
import { useControls } from "leva";
import { Color } from "three";
import CustomShaderMaterialType from "three-custom-shader-material/vanilla";

export default function useWaterControls(
  material: React.RefObject<CustomShaderMaterialType>
) {
  useControls(
    "Water",
    () => ({
      Color: {
        value: "#52a7f7",
        onChange: (v) => {
          material.current!.uniforms.waterColor.value = new Color(
            v
          ).convertLinearToSRGB();
        },
      },
      HighlightColor: {
        value: "#b3ffff",
        onChange: (v) => {
          material.current!.uniforms.waterHighlight.value = new Color(
            v
          ).convertLinearToSRGB();
        },
      },
      offsetX: {
        value: 0,
        onChange: (v) => {
          material.current!.uniforms.offsetX.value = v;
        },
      },
      offsetY: {
        value: 0,
        onChange: (v) => {
          material.current!.uniforms.offsetY.value = v;
        },
      },
    }),
    [material]
  );
}
