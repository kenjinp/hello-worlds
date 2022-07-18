import { OrbitCamera, Planet } from "@hello-worlds/react";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as React from "react";
import BasicScene from "../BasicScene";
import { EARTH_RADIUS } from "../planet/PlanetConfigurator";

// @ts-ignore this is dumb... its a webworker
import planetWorker from "./p.worker";

function Editor() {
  const planet = useControls("planet", {
    invert: false,
    planetRadius: {
      min: 10,
      max: EARTH_RADIUS * 2,
      value: 4_000, // EARTH_RADIUS / 4,
      step: 10,
    },
    minCellSize: {
      min: 0,
      max: 10_000_000,
      value: 25,
      step: 10,
    },
    minCellResolution: {
      min: 0,
      max: 10_000_000,
      value: 128,
      step: 10,
    },
  });

  const { camera } = useThree();
  return (
    <Planet
      planetProps={{
        radius: planet.planetRadius,
        minCellSize: planet.minCellSize,
        minCellResolution: planet.minCellResolution,
        invert: planet.invert,
      }}
      lodOrigin={camera.position}
      worker={planetWorker}
    >
      <OrbitCamera />
    </Planet>
  );
}

export default function() {
  React.useEffect(() => {}, []);
  return (
    <BasicScene>
      <Editor />
    </BasicScene>
  );
}
