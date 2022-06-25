import { Stars } from "@react-three/drei";
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

export const InvertedLightRig: React.FC = ({}) => {
  return (
    <group>
      <hemisphereLight
        intensity={0.3}
        color={new Color(0xffffff)}
        groundColor={new Color(0xffffff)}
        position={new Vector3(0, 0, 0)}
        // castShadow
      />
      <directionalLight
        color={0xffffff}
        intensity={1}
        position={new Vector3(-1, 0.75, 1).multiplyScalar(-50)}
        castShadow
        shadow-mapSize-height={512 * 3}
        shadow-mapSize-width={512 * 3}
      />
      <mesh scale={new Vector3(10, 10, 10)}>
        <sphereGeometry></sphereGeometry>
        <meshStandardMaterial
          color={new Color("white")}
          emissive={new Color("white")}
        ></meshStandardMaterial>
      </mesh>

      <group>
        <mesh
          castShadow
          receiveShadow
          scale={new Vector3(20, 20, 20)}
          position={new Vector3(-1, 0.75, 1).multiplyScalar(500)}
        >
          <sphereGeometry></sphereGeometry>
          <meshStandardMaterial
            color={new Color("blue")}
          ></meshStandardMaterial>
        </mesh>
      </group>
    </group>
  );
};

export const BasicScene: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <Canvas
      gl={{ logarithmicDepthBuffer: true }}
      camera={{
        near: 0.01,
        far: 100_000_000,
        position: new Vector3(0, 800, 800),
      }}
      shadows
    >
      <React.Suspense fallback={null}>
        <Perf position="top-left" />
        {/* <color attach="background" args={["lightblue"]} /> */}
        {/* <gridHelper args={[500, 500]} position={[0, -0.2, 0]} /> */}
        {/* <fogExp2 density={0.001} color={new Color(0xdfe9f3)} /> */}
        <fogExp2 attach="fog" color={0x40e2ff} density={0.000125} />
        <SpaceBox />
        <InvertedLightRig />
        <group scale={new Vector3(5, 5, 5)}>
          <Stars />
        </group>
        {children}
      </React.Suspense>
    </Canvas>
  );
};

export default BasicScene;
