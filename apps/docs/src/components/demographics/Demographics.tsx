import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { City } from "@hello-worlds/cultures";
import * as React from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { generateUUID } from "three/src/math/MathUtils";
import { ECS } from "../../state/ecs";

const Demographics: React.FC = () => {
  const { entities } = ECS.useArchetype("kingdom");

  const cities = React.useMemo(
    () =>
      entities.reduce(
        (memo, { kingdom }) => [...memo, ...kingdom.cities],
        [] as City[]
      ),
    [entities]
  );

  const towns = React.useMemo(
    () =>
      entities.reduce(
        (memo, { kingdom }) => [...memo, ...kingdom.towns],
        [] as City[]
      ),
    [entities]
  );

  const totalUrbanPopultation = React.useMemo(
    () =>
      entities
        .map(({ kingdom }) => kingdom)
        .reduce((memo, kingdom) => {
          return memo + kingdom.urbanPopulation;
        }, 0),
    [entities]
  );

  const totalUrban = React.useMemo(
    () =>
      entities
        .map(({ kingdom }) => kingdom)
        .reduce((memo, kingdom) => {
          return memo + kingdom.population;
        }, 0),
    []
  );

  React.useEffect(() => {
    ReactTooltip.rebuild();
  });

  return (
    <div>
      <p>
        Total Urban Population (Towns and Cities):{" "}
        {totalUrbanPopultation.toLocaleString()}
      </p>
      <p>Estimated Global Population: {totalUrban.toLocaleString()}</p>
      <p>Cities of note: {cities.length.toLocaleString()}</p>
      <p>
        Towns and other important settlements: {towns.length.toLocaleString()}
      </p>
      <h2>Cities</h2>
      <hr />
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
      <ReactTooltip id="capital" aria-haspopup="true">
        <span>Capital City</span>
      </ReactTooltip>
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
          <div>
            {city.name}{" "}
            {city.isCapital && (
              <a data-tip data-for="capital" style={{ color: "#ffff42" }}>
                <FontAwesomeIcon icon={faCrown} />
              </a>
            )}
          </div>
        </h3>
        <i>{city.kingdom.name}</i> |{" "}
        <span>{city.population.toLocaleString()}</span>
      </div>
    </li>
  );
};

export default Demographics;
