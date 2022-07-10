import * as React from "react";
import styled from "styled-components";
import { MathUtils } from "three";
import { generateUUID } from "three/src/math/MathUtils";
import Kingdom from "../../lib/demographics/Demographics";

const Demographics: React.FC = () => {
  const [kingdoms, setKingdoms] = React.useState(
    Array(MathUtils.randInt(15, 50))
      .fill(0)
      .map(() => new Kingdom())
  );
  return (
    <ul
      style={{
        minWidth: "500px",
        overflowY: "auto",
        resize: "both",
      }}
    >
      {kingdoms
        .sort((a, b) => b.density - a.density)
        .map((kingdom) => (
          <KingdomDisplay
            kingdom={kingdom}
            key={generateUUID()}
          ></KingdomDisplay>
        ))}
    </ul>
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

const KingdomDisplay: React.FC<{ kingdom: Kingdom }> = ({ kingdom }) => {
  return (
    <li>
      <div>
        <h3>{kingdom.name}</h3>
        <h4>
          <i>{kingdom.government}</i>
          {" | "}
          <span>{kingdom.culture.power[0].name}</span>
        </h4>
        <PillList>
          {kingdom.culture.traits.map((trait) => (
            <TraitPill key={trait.name}>{trait.name}</TraitPill>
          ))}
        </PillList>
        <div>
          {kingdom.culture.values.map((value) => (
            <TraitPill key={value.name}>{value.name}</TraitPill>
          ))}
        </div>
        <div>{kingdom.densityLevel} economy</div>
        <div>speaks: {kingdom.languageName}</div>
      </div>
    </li>
  );
};

export default Demographics;
