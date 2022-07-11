import * as React from "react";
import { Vector3 } from "three";
import { ECS } from "../../state/ecs";
import { EARTH_RADIUS } from "./PlanetConfigurator";
// import { EARTH_RADIUS } from "./PlanetConfigurator";
import { RenderPlanet } from "./RenderPlanet";

export const PlanetGenerator = () => {
  const RADIUS = EARTH_RADIUS;

  React.useEffect(() => {
    const entity = ECS.world.createEntity({
      position: new Vector3(),
      planet: { name: "Ord", radius: RADIUS },
    });

    return () => {
      ECS.world.destroyEntity(entity);
    };
  }, []);

  return <RenderPlanet />;
};
