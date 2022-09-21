import { useThree } from "@react-three/fiber";
import * as React from "react";
import { Color, CubeTextureLoader } from "three";
import { useTheme } from "./world-builder/Theme";
import { THEMES } from "./world-builder/WorldBuilder.state";

// import back from "../../static/img/spacebox-4/back.png";
// import bottom from "../../static/img/spacebox-4/bottom.png";
// import front from "../../static/img/spacebox-4/front.png";
// import left from "../../static/img/spacebox-4/left.png";
// import right from "../../static/img/spacebox-4/right.png";
// import top from "../../static/img/spacebox-4/top.png";

export const SpaceBox = () => {
  const { scene } = useThree();
  // const { background } = useControls("background", {
  //   background: {
  //     min: 1,
  //     max: 3,
  //     value: 1,
  //     step: 1
  //   }
  // })
  const theme = useTheme();
  const background = 2;

  React.useEffect(() => {
    const back = `/img/spacebox-${background}/back.png`
    const bottom = `/img/spacebox-${background}/bottom.png`
    const front = `/img/spacebox-${background}/front.png`
    const left = `/img/spacebox-${background}/left.png`
    const right = `/img/spacebox-${background}/right.png`
    const top = `/img/spacebox-${background}/top.png`

    const urls = [right, left, top, bottom, front, back];

    const cube = new CubeTextureLoader().load(urls);
    console.log({theme})
    scene.background = new Color(0x000000);
    if (theme !== THEMES.HARD_SCIFI) {
      scene.background = cube; 
    }
  }, [background, theme]);

  return null;
};
