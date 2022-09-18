import { PlanetProps } from "@hello-worlds/planets";
import { Tag } from "miniplex";
import { createECS } from "miniplex-react";
import { Color, Mesh, Vector3 } from "three";

export type AstralBody =  {
  position: Vector3;
  rotationSpeed: number;
  children: Entity[];
  offset: Vector3;
  name?: string;
} & Partial<PlanetProps>

export type Star = AstralBody & {
  color: Color,
  emissive: Color,
  lightIntensity: number,
  mesh?: Mesh;
  star: Tag;
}

export type Planet = AstralBody & {
  planet: Tag;
  seed: string;
  mesh?: Mesh;
  focused?: boolean;
}

type Entity = Star | Planet;

export const ECS = createECS<Entity>();
