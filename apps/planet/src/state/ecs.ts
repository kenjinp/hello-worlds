import { createECS } from "miniplex-react";

type Entity = {
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  playerId?: number;
  planet?: { name: string; radius: number };
  controls?: { type: "fly" | "orbit" };
};

export const ECS = createECS<Entity>();
