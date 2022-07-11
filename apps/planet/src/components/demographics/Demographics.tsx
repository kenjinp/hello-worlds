import * as React from "react";
import styled from "styled-components";
import { generateUUID } from "three/src/math/MathUtils";
import { City } from "../../lib/demographics/Demographics";
import { ECS } from "../../state/ecs";

const Demographics: React.FC = () => {
  const { entities } = ECS.useArchetype("kingdom");

  const cities = entities.reduce(
    (memo, { kingdom }) => [...memo, ...kingdom.cities],
    [] as City[]
  );
  const towns = entities.reduce(
    (memo, { kingdom }) => [...memo, ...kingdom.towns],
    [] as City[]
  );

  const totalUrbanPopultation = entities
    .map(({ kingdom }) => kingdom)
    .reduce((memo, kingdom) => {
      return memo + kingdom.urbanPopulation;
    }, 0);

  const totalUrban = entities
    .map(({ kingdom }) => kingdom)
    .reduce((memo, kingdom) => {
      return memo + kingdom.population;
    }, 0);

  return (
    <div>
      <p>
        Total Urban Population (Towns and Cities):{" "}
        {totalUrbanPopultation.toLocaleString()}
      </p>
      <p>Estimated Global Population: {totalUrban.toLocaleString()}</p>
      <ul
        style={{
          minWidth: "500px",
          overflowY: "auto",
          resize: "both",
        }}
      >
        {cities
          .sort((a, b) => b.population - a.population)
          .map((city) => (
            <CityDisplay city={city} key={generateUUID()}></CityDisplay>
          ))}
      </ul>
    </div>
  );
};

export const TraitPill = styled.div`
  display: inline-block;
  border-radius: 1em;
  padding: 0.5em 1em;
  margin: 0 0.5em 0.5em 0;
  white-space: nowrap;
  background: #ffffff17;
`;

export const PillList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const CityDisplay: React.FC<{ city: City }> = ({ city }) => {
  return (
    <li>
      <div>
        <h3>
          {city.name} | {city.kingdom.name}
        </h3>
        <h4>{city.population.toLocaleString()}</h4>
      </div>
    </li>
  );
};

export default Demographics;
