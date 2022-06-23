import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import Player from "../player/Player";

export interface PhysicsProps {
  physicsStep?: number;
  gravity?: number;
  startingPosition: THREE.Vector3;
}

const playerVelocity = new THREE.Vector3();
const collisionCast = new THREE.Raycaster();
const axis = new THREE.Vector3(0, 1, 0);

export const PlayerPhysicsSystem: React.FC<
  React.PropsWithChildren<PhysicsProps>
> = ({ gravity = 9.8, startingPosition }) => {
  const { scene } = useThree();

  const playerRef = React.useRef<THREE.Mesh>(null);
  const controlsRef = React.useRef<any>(null);

  const updatePhysics = (delta: number) => {
    if (!playerRef.current) {
      return;
    }

    const gravityVector = playerRef.current.position
      .clone()
      .normalize()
      .multiplyScalar(delta)
      .multiplyScalar(gravity);

    playerVelocity.add(gravityVector);

    collisionCast.set(playerRef.current.position, gravityVector.normalize());

    const intersects = collisionCast.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
      const intersection = intersects[i];
      if (intersection.distance <= 2) {
        playerVelocity.set(0, 0, 0);
      }
    }

    playerRef.current.position.add(playerVelocity);
    controlsRef.current?.target.copy(playerRef.current.position);
    playerRef.current.lookAt(gravityVector.clone().normalize());
  };

  useFrame((_, delta) => {
    updatePhysics(delta);
  });

  return (
    <Player ref={playerRef} position={startingPosition}>
      <OrbitControls makeDefault maxDistance={10} ref={controlsRef} />
    </Player>
  );
};
