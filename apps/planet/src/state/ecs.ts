import { createECS } from "miniplex-react";

type Entity = {
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  health?: number;
  playerId: number;
};

export const ECS = createECS<Entity>();
