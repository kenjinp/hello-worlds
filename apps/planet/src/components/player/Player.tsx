import * as React from "react";
import * as THREE from "three";

const Player = React.forwardRef<
  THREE.Mesh,
  React.PropsWithChildren<{
    position: THREE.Vector3;
  }>
>(({ children, position }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="white" />
      {children}
      <axesHelper scale={new THREE.Vector3(4, 4, 4)} />
    </mesh>
  );
});

export default Player;
