import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import * as React from "react";
import { Color, Vector3 } from "three";
import { SpaceBox } from "./SpaceBox";

export const LightRig: React.FC = ({}) => {
  return (
    <mesh>
      <hemisphereLight
        intensity={0.6}
        color={new Color(0x0000ff)}
        groundColor={new Color(0x00ff00)}
        position={new Vector3(0, 500, 0)}
      />
      <directionalLight
        color={0xffffff}
        intensity={1}
        position={new Vector3(-1, 0.75, 1).multiplyScalar(50)}
        castShadow
      />
    </mesh>
  );
};

export const BasicScene: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <Canvas
      gl={{ logarithmicDepthBuffer: true }}
      camera={{ far: 100_000_000, position: new Vector3(0, 800, 800) }}
    >
      <React.Suspense fallback={null}>
        <Perf position="top-left" />
        <color attach="background" args={["lightblue"]} />
        <gridHelper args={[500, 500]} position={[0, -0.2, 0]} />
        <fog near={500} far={1000}></fog>
        <SpaceBox />
        <LightRig />
        <OrbitControls />
        <group scale={new Vector3(5, 5, 5)}>
          <Stars />
        </group>
        {children}
      </React.Suspense>
    </Canvas>
  );
};

export default BasicScene;
