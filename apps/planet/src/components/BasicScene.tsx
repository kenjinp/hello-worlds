import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
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
    <Canvas>
      <React.Suspense fallback={null}>
        <color attach="background" args={["lightblue"]} />
        <gridHelper args={[500, 500]} position={[0, -0.2, 0]} />
        <fog near={500} far={1000}></fog>
        <SpaceBox />
        <LightRig />
        <OrbitControls />
        <Stars />
        {children}
      </React.Suspense>
    </Canvas>
  );
};

export default BasicScene;
