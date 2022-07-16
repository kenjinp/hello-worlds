import { Planet as HelloPlanet } from "@hello-worlds/planets";
import { Planet } from "@hello-worlds/react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as React from "react";
import { Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useColorController } from "../generators/ColorController";
import { useHeightController } from "../generators/HeightController";
import { useNoiseController } from "../noise/NoiseController";
import { useTerrainController } from "../terrain/TerrainController";
import planetWorker from "./PlanetWorker?worker";

export const EARTH_RADIUS = 6_357 * 1_000;

// https://easings.net/en#easeOutExpo
const quadtratic = (t: number) => t * (-(t * t) * t + 4 * t * t - 6 * t + 4);
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(4, -10 * x);
}

const PlanetConfigurator: React.FC<{ radius: number; name: string }> = ({
  radius,
  name,
}) => {
  const workerDebugRef = React.useRef<HTMLDivElement>(null);
  const planetEngine = React.useRef<HelloPlanet | null>(null);
  const { scene, camera } = useThree();
  const origin = React.useRef<Vector3>(camera.position.clone());
  const orbitControls = React.useRef<OrbitControlsImpl>(null);

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
  const [showOrbitControls, setShowOrbitControls] = React.useState(false);
  const { noise, noiseParams } = useNoiseController("noise", {
    seed: (Math.random() + 1).toString(36).substring(7),
  });
  const { noiseParams: biomeParams } = useNoiseController("biomes", {
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 1,
    scale: 2048.0,
    noiseType: "simplex",
    seed: 2,
    height: 1,
  });
  const terrain = useTerrainController();

  const { colorParams, colorNoiseParams } = useColorController();

  const { heightParams } = useHeightController(noise);

  const altitude = React.useRef(0);

  React.useEffect(() => {
    planetEngine.current?.planetProps.radius &&
      camera.position.copy(
        new Vector3(
          planetEngine.current?.planetProps.radius * 1.5,
          0,
          planetEngine.current?.planetProps.radius * 1.5
        )
      );
  }, [planetEngine.current?.planetProps.radius]);

  useFrame(() => {
    if (!planetEngine.current) {
      return;
    }

    camera.lookAt(planetEngine.current.rootGroup.position);

    if (planetEngine.current.planetProps.radius) {
      setShowOrbitControls(true);
    } else {
      setShowOrbitControls(false);
    }

    if (!orbitControls.current) {
      return;
    }

    altitude.current =
      camera.position.distanceTo(planetEngine.current?.rootGroup.position) -
        planetEngine.current?.planetProps?.radius || 0;
    const altimeter = document.body.querySelector("#altitude");
    const scrollSpeed = document.body.querySelector("#scrollspeed");

    if (altimeter) {
      altimeter.innerText = `Altitude ${(
        altitude.current / 1000
      ).toLocaleString()} km`;
    }
    if (scrollSpeed && orbitControls.current) {
      scrollSpeed.innerText = `Speed ${
        orbitControls.current.zoomSpeed
      } ${altitude.current / orbitControls.current.maxDistance}`;
    }

    orbitControls.current.zoomSpeed = easeOutExpo(
      altitude.current / orbitControls.current.maxDistance
    );

    orbitControls.current.rotateSpeed = quadtratic(
      altitude.current / orbitControls.current.maxDistance
    );
  });


  return (
    <>
      {/* <Html>
        <h1>{name}</h1>
        <div ref={workerDebugRef}></div>
      </Html> */}
      <Planet
        ref={planetEngine}
        planetProps={{
          width: terrain.width,
          radius: planet.planetRadius,
          minCellSize: planet.minCellSize,
          minCellResolution: planet.minCellResolution,
          invert: planet.invert,
        }}
        origin={camera.position}
        worker={planetWorker}
      >
        {showOrbitControls && (
          <OrbitControls
            ref={orbitControls}
            enablePan={false}
            maxDistance={planetEngine.current?.planetProps?.radius * 10}
            minDistance={planetEngine.current?.planetProps?.radius + 100}
          />
        )}
      </Planet>
    </>
  );
};

export default PlanetConfigurator;
