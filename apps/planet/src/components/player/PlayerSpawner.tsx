import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { MathUtils, Vector3 } from "three";
import { generateUUID } from "three/src/math/MathUtils";
import { ECS } from "../../state/ecs";

const spawnCast = new THREE.Raycaster();
const origin = new THREE.Vector3();
export const PlayerSpawner: React.FC = () => {
  const { scene, camera } = useThree();
  const handleSpawnPlayer = (): void => {
    const randomVec = new Vector3(
      MathUtils.randInt(-100, 100),
      MathUtils.randInt(-100, 100),
      MathUtils.randInt(-100, 100)
    );

    if (randomVec.x == 0 && randomVec.y === 0 && randomVec.z === 0) {
      return void handleSpawnPlayer();
    }

    randomVec.normalize();
    spawnCast.set(origin, randomVec);
    const intersects = spawnCast.intersectObjects(scene.children, true);

    if (intersects[0]) {
      const intersection = intersects[0];

      const playerPosition = intersection.point.sub(
        randomVec.clone().multiplyScalar(10)
      );

      ECS.world.createEntity({
        position: playerPosition,
        playerId: generateUUID(),
      });
    }
  };

  return (
    <Html transform={false}>
      <button onClick={handleSpawnPlayer}>Spawn Player</button>
    </Html>
  );
};
