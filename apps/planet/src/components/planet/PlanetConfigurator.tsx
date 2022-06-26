import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as React from "react";
import { Vector3 } from "three";
import { NOISE_STYLES } from "../../lib/noise/Noise";
import PlanetEngine from "../../lib/planet/PlanetEngine";
import { useColorController } from "../generators/ColorController";
import { useHeightController } from "../generators/HeightController";
import { useNoiseController } from "../noise/NoiseController";
import { useTerrainController } from "../terrain/TerrainController";
import Planet from "./Planet";

export const EARTH_RADIUS = 6_357 * 1_000;

const PlanetConfigurator: React.FC<{ radius: number }> = ({ radius }) => {
  const workerDebugRef = React.useRef<HTMLDivElement>(null);
  const planetEngine = React.useRef<PlanetEngine | null>(null);
  const { scene, camera } = useThree();
  const origin = React.useRef<Vector3>(camera.position.clone());

  useFrame((state, delta) => {
    if (workerDebugRef.current) {
      workerDebugRef.current.innerHTML = `
        busy: ${planetEngine.current?.busyInfo.busy}
        busyLength: ${planetEngine.current?.busyInfo.busyLength}
        queueLength: ${planetEngine.current?.busyInfo.queueLength}
        \norigin:\n${[
          origin.current.x,
          origin.current.y,
          origin.current.z,
        ].join(",\n")}
        \ncamera:\n${[
          camera.position.x,
          camera.position.y,
          camera.position.z,
        ].join(",\n")}
      `;
    }

    if (state.scene.userData.camera) {
      // origin.current.copy(state.scene.userData.origin);
      origin.current.copy(state.scene.userData.camera);
      // origin.current.add(state.scene.userData.camera);
    }

    // if (planetEngine.current) {
    //   planetEngine.current.rootGroup.rotation.y += delta * 0.2;
    // }
  });

  const planet = useControls("planet", {
    invert: false,
    planetRadius: {
      min: 10,
      max: 10_000_000,
      value: radius,
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
      value: 48,
      step: 10,
    },
  });
  const { noise, noiseParams } = useNoiseController("noise", {
    seed: (Math.random() + 1).toString(36).substring(7),
  });
  const { noiseParams: biomeParams } = useNoiseController("biomes", {
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 1,
    scale: 2048.0,
    noiseType: NOISE_STYLES.simplex,
    seed: 2,
    height: 1,
  });
  const terrain = useTerrainController();

  const { colorParams, colorNoiseParams } = useColorController();

  const { heightParams } = useHeightController(noise);

  return (
    <>
      <Html>
        <div ref={workerDebugRef}></div>
      </Html>
      <Planet
        ref={planetEngine}
        {...{
          width: terrain.width,
          radius: planet.planetRadius,
          minRadius: heightParams.minRadius,
          maxRadius: heightParams.maxRadius,
          minCellSize: planet.minCellSize,
          minCellResolution: planet.minCellResolution,
          invert: planet.invert,
          noiseParams,
          colorNoiseParams,
          biomeParams,
          colorGeneratorParams: colorParams,
        }}
        origin={camera.position}
      />
    </>
  );
};

export default PlanetConfigurator;
