import { ECS } from "../../state/ecs";
import PlanetConfigurator from "./PlanetConfigurator";

export const RenderPlanet = () => {
  const { entities } = ECS.useArchetype("position", "planet");

  return (
    <>
      {entities.map(({ position, planet }) => {
        return <PlanetConfigurator radius={planet.radius} name={planet.name} />;
      })}
    </>
  );
};
