import * as React from "react"
import styled from "styled-components"
import { generateUUID } from "three/src/math/MathUtils"
import Kingdom from "../../lib/demographics/Demographics"
import { ECS } from "../../state/ecs"

const States: React.FC = () => {
  const { entities } = ECS.useArchetype("kingdom")

  const renderable = React.useMemo(
    () =>
      entities
        .sort((a, b) => b.kingdom.density - a.kingdom.density)
        .map(({ kingdom }) => (
          <StatesDisplay kingdom={kingdom} key={generateUUID()}></StatesDisplay>
        )),
    [entities],
  )

  return (
    <div>
      <p>Polities of note: {entities.length.toLocaleString()} </p>
      <ul
        style={{
          minWidth: "500px",
          overflowY: "auto",
          resize: "both",
        }}
      >
        {renderable}
      </ul>
    </div>
  )
}

export const TraitPill = styled.div`
  display: inline-block;
  border-radius: 1em;
  padding: 0.5em 1em;
  margin: 0 0.5em 0.5em 0;
  white-space: nowrap;
  background: #ffffff17;
`

export const PillList = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const StatesDisplay: React.FC<{ kingdom: Kingdom }> = ({ kingdom }) => {
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
          {kingdom.culture.traits.map(trait => (
            <TraitPill key={trait.name}>{trait.name}</TraitPill>
          ))}
        </PillList>
        <div>
          {kingdom.culture.values.map(value => (
            <TraitPill key={value.name}>{value.name}</TraitPill>
          ))}
        </div>
        <div>capital: {kingdom.capital?.name}</div>
        <div>{kingdom.densityLevel} economy</div>
        <div>speaks: {kingdom.languageName}</div>
      </div>
    </li>
  )
}

export default States
