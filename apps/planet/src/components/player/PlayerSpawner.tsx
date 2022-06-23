import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { MathUtils, Vector3 } from "three";
import { useStore } from "../../store";

const spawnCast = new THREE.Raycaster();
const origin = new THREE.Vector3();
export const PlayerSpawner: React.FC = () => {
  const { scene } = useThree();
  const state = useStore();

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
    spawnCast.firstHitOnly = true;
    const intersects = spawnCast.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
      const intersection = intersects[i];
      state.addPlayerSpawnPosition(
        intersection.point.sub(randomVec.clone().multiplyScalar(10))
      );
    }
  };

  return (
    <Html transform={false}>
      <button onClick={handleSpawnPlayer}>Spawn Player</button>
    </Html>
  );
};
