import { useFrame, useLoader } from "@react-three/fiber";
import * as React from "react";
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  NearestFilter,
  RepeatWrapping,
  TextureLoader,
} from "three";
import cloudTexture from "./clouds.png";

export const Clouds: React.FC<{ radius: number }> = ({ radius }) => {
  const materialRef = React.useRef<MeshStandardMaterial>(null);
  const cloudRef = React.useRef<Mesh>(null);
  const colorMap = useLoader(TextureLoader, cloudTexture);

  React.useEffect(() => {
    colorMap.magFilter = NearestFilter;
    colorMap.wrapS = colorMap.wrapT = RepeatWrapping;
    colorMap.repeat.set(10, 10);
    colorMap.needsUpdate = true;
  }, [colorMap]);

  useFrame((_, delta) => {
    if (!cloudRef.current) {
      return;
    }
    cloudRef.current.rotation.y += (1 / (128 * 2)) * delta;
  });

  return (
    <mesh ref={cloudRef}>
      <sphereBufferGeometry args={[radius, 64, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={0xffffff}
        transparent
        map={colorMap}
        side={DoubleSide}
      />
    </mesh>
  );
};
