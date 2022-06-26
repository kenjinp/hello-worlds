import { OrbitControls } from "@react-three/drei";
import * as React from "react";
import * as THREE from "three";
import { ECS } from "../../state/ecs";

export const RenderPlayers = () => {
  const { entities } = ECS.useArchetype("playerId", "position");

  console.log({ entities });

  return (
    <>
      {entities.map(({ playerId, position }) => {
        return (
          <Player key={playerId} position={position}>
            {/* <OrbitControls maxZoom={20} /> */}
            {/* <FollowCameraSystem /> */}
            {/* <FirstPersonControls position={position} /> */}
            <OrbitControls
            // minDistance={50}
            // position={position}
            // enableZoom={false}
            // enablePan={false}
            // minPolarAngle={Math.PI / 2}
            // maxPolarAngle={Math.PI / 2}
            />
          </Player>
        );
      })}
    </>
  );
};

const Player = React.forwardRef<
  THREE.Mesh,
  React.PropsWithChildren<{
    position: THREE.Vector3;
  }>
>(({ children, position }, ref) => {
  console.log("player spawning", position);

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
