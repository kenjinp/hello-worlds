import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { MathUtils, Object3D, Quaternion, Vector3 } from "three";
import { generateUUID } from "three/src/math/MathUtils";
import { ECS } from "../../state/ecs";

const spawnCast = new THREE.Raycaster();
const origin = new THREE.Vector3();

export const useSpawnECSObjectInScene = (func: (position: Vector3) => any) => {
  const { scene } = useThree();
  const handleSpawnObject = (): void => {
    const randomVec = new Vector3(
      MathUtils.randInt(-100, 100),
      MathUtils.randInt(-100, 100),
      MathUtils.randInt(-100, 100)
    );

    if (randomVec.x == 0 && randomVec.y === 0 && randomVec.z === 0) {
      return void handleSpawnObject();
    }

    randomVec.normalize();
    spawnCast.set(origin, randomVec);
    const intersects = spawnCast.intersectObjects(scene.children, true);

    if (intersects[0]) {
      const intersection = intersects[0];

      const position = intersection.point.sub(
        randomVec.clone().multiplyScalar(1)
      );

      // this will point the object "up" towards planetary origin
      const euler = new Object3D();
      euler.lookAt(randomVec);
      euler.rotateOnAxis(new Vector3(1, 0, 0), (Math.PI / 180) * -90);

      const rotation = new Quaternion().setFromEuler(euler.rotation, true);

      ECS.world.createEntity({
        ...func(position),
        position,
        rotation,
      });
    }
  };

  return handleSpawnObject;
};

export const PlayerSpawner: React.FC = () => {
  const spawn = useSpawnECSObjectInScene(() => ({
    playerId: generateUUID(),
  }));

  const handleSpawnPlayer = (): void => {
    spawn();
  };

  return (
    <Html transform={false}>
      <button onClick={handleSpawnPlayer}>Spawn Player</button>
    </Html>
  );
};
