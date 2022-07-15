import * as React from "react";
import { Group } from "three";
import { ECS } from "../../state/ecs";
import PlanetConfigurator from "./PlanetConfigurator";

export const RenderPlanet = () => {
  const { entities } = ECS.useArchetype("position", "planet");
  const ref = React.useRef<Group>(null);

  // useFrame(() => {
  //   if (!ref.current) {
  //     return;
  //   }
  //   ref.current.rotation.y += 0.00005;
  // });

  return (
    <>
      {entities.map(({ position, planet }) => {
        return (
          <group ref={ref}>
            <PlanetConfigurator
              key={planet.name}
              radius={planet.radius}
              name={planet.name}
            />
            ;
          </group>
        );
      })}
    </>
  );
};
