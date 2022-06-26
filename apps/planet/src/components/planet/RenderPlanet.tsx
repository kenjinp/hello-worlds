import { ECS } from "../../state/ecs";
import PlanetConfigurator, { EARTH_RADIUS } from "./PlanetConfigurator";

export const RenderPlanet = () => {
  const { entities } = ECS.useArchetype("position", "planet");

  return (
    <ECS.Entities entities={entities}>
      <PlanetConfigurator radius={EARTH_RADIUS} />
    </ECS.Entities>
  );
};
