import { useThree } from "@react-three/fiber";
import * as React from "react";
import { Color, CubeTextureLoader } from "three";

import back from "../../static/img/spacebox/back.png";
import bottom from "../../static/img/spacebox/bottom.png";
import front from "../../static/img/spacebox/front.png";
import left from "../../static/img/spacebox/left.png";
import right from "../../static/img/spacebox/right.png";
import top from "../../static/img/spacebox/top.png";

export const SpaceBox = () => {
  const { scene } = useThree();

  React.useEffect(() => {
    const urls = [right, left, top, bottom, front, back];

    const cube = new CubeTextureLoader().load(urls);

    scene.background = new Color(0x000000);
  }, []);

  return null;
};
