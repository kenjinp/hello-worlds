import { createECS } from "miniplex-react";
import { Quaternion, Vector3 } from "three";

type Entity = {
  position: Vector3;
  offset?: Vector3;
  velocity?: Vector3;
  playerId?: string;
  planet?: { name: string; radius: number };
  rotation?: Quaternion;
  controls?: { type: "fly" | "orbit" };
};

export const ECS = createECS<Entity>();
