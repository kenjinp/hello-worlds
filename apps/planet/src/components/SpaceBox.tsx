import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CubeTextureLoader } from "three";

import back from "../assets/spacebox/back.png";
import bottom from "../assets/spacebox/bottom.png";
import front from "../assets/spacebox/front.png";
import left from "../assets/spacebox/left.png";
import right from "../assets/spacebox/right.png";
import top from "../assets/spacebox/top.png";

export const SpaceBox = () => {
  const { scene } = useThree();

  useEffect(() => {
    const urls = [right, left, top, bottom, front, back];

    const cube = new CubeTextureLoader().load(urls);

    scene.background = cube;
  }, []);

  return null;
};
