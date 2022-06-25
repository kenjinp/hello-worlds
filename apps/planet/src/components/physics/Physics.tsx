import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { Color, Vector3 } from "three";
import { useControls } from "../../hooks/useControls";
import { FollowCameraSystem } from "../cameras/FollowCamera";
import Player from "../player/Player";

export interface PhysicsProps {
  physicsStep?: number;
  gravity?: number;
  startingPosition: THREE.Vector3;
}

const playerSpeed = 2.5;

const playerVelocity = new THREE.Vector3();
const collisionCast = new THREE.Raycaster();
const axis = new THREE.Vector3(1, 0, 0);
const upVector = new THREE.Vector3(0, 1, 0);
let tempVector = new THREE.Vector3();
let tempVector2 = new THREE.Vector3();

export const PlayerPhysicsSystem: React.FC<
  React.PropsWithChildren<PhysicsProps>
> = ({ gravity = 9.8, startingPosition }) => {
  const {
    scene,
    camera,
    gl: { domElement },
  } = useThree();

  const controls = useControls();

  const playerRef = React.useRef<THREE.Mesh>(null);
  const controlsRef = React.useRef<any>(null);

  const updatePhysics = (delta: number) => {
    if (!playerRef.current) {
      return;
    }

    // controlsRef.current.maxPolarAngle = Math.PI / 2;
    // controlsRef.current.minDistance = 1;
    // controlsRef.current.maxDistance = 20;

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
      if (intersection.distance <= 5) {
        playerVelocity.set(0, 0, 0);
      }
    }

    playerRef.current.position.add(playerVelocity);
    playerRef.current.lookAt(new Vector3(0, 0, 0));
    playerRef.current.rotateOnAxis(new Vector3(1, 0, 0), (Math.PI / 180) * 90);

    // const viewVector = controls.mouse.pointer();

    // move player
    // const angle = playerRef.current.
    // const angle = controlsRef.current.getAzimuthalAngle();
    // console.log(angle);
    // if (controls.up.query()) {
    //   tempVector.set(0, -1, 0).applyAxisAngle(upVector, angle);
    //   playerRef.current.position.addScaledVector(
    //     tempVector,
    //     playerSpeed * delta
    //   );
    // }

    // if (controls.down.query()) {
    //   tempVector.set(0, 1, 0).applyAxisAngle(upVector, angle);
    //   playerRef.current.position.addScaledVector(
    //     tempVector,
    //     playerSpeed * delta
    //   );
    // }

    // if (controls.left.query()) {
    //   tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
    //   playerRef.current.position.addScaledVector(
    //     tempVector,
    //     playerSpeed * delta
    //   );
    // }

    // if (controls.right.query()) {
    //   tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
    //   playerRef.current.position.addScaledVector(
    //     tempVector,
    //     playerSpeed * delta
    //   );
    // }

    // playerRef.current.updateMatrixWorld();

    // camera.quaternion.copy(playerRef.current.quaternion);

    // camera.position.sub(controlsRef.current.target);
    // controlsRef.current.target.copy(playerRef.current.position);
    // camera.position.add(playerRef.current.position);

    // controlsRef.current.update();
  };

  useFrame((_, delta) => {
    updatePhysics(delta);
  });

  return (
    <>
      <Player ref={playerRef} position={startingPosition}>
        <FollowCameraSystem />
        <mesh>
          <pointLight intensity={0.5} color={new Color(0xffbc3d)} decay={2} />
        </mesh>
      </Player>
    </>
  );
};
