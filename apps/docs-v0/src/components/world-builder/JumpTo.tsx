import * as React from "react"

import styled from "styled-components"
import { ECS } from "./WorldBuilder.ecs"
import { EARTH_RADIUS } from "./WorldBuilder.math"
import { archetypes } from "./WorldBuilder.state"

export const PlanetButton = styled.button`
  border-radius: 0.5em;
  padding: 0.5em 1em 0.5em;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: bold;
  color: #f4f4f4;
  &:hover,
  &.focused {
    background: #dd3cff9c;
    color: #f4f4f4;
    background: #2f2f2f;
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  }
`

export const PlanetIcon = styled.div`
  border-radius: 0.5em;
  padding: 0.5em 1em 0.5em;
  background: transparent;
  border: 0;
  cursor: pointer;

  ${props =>
    props.focused &&
    `
    background: #dd3cff9c;
    color: pink;
    background: #2f2f2f;
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);`}

  &:hover {
    background: #dd3cff9c;
    color: #f4f4f4;
    background: #2f2f2f;
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  }
`

function alphabetize(n: number) {
  var result = ""
  do {
    result = ((n % 26) + 10).toString(36) + result
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return result.toUpperCase()
}

export function romanize(num: number) {
  if (isNaN(num)) return NaN
  var digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ],
    roman = "",
    i = 3
  while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman
  return Array(+digits.join("") + 1).join("M") + roman
}

export const JumpTo: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: "1em" }}>
        <h5>Stars</h5>
        <ECS.Entities in={archetypes.star}>
          {entity => {
            return <PlanetButton key={entity.name}>{entity.name}</PlanetButton>
          }}
        </ECS.Entities>
      </div>
      <div style={{ marginBottom: "1em" }}>
        <h5>Planets</h5>
        <ECS.Entities in={archetypes.planet}>
          {entity => {
            return (
              <div key={entity.name}>
                <PlanetButton>
                  {entity.name} ({entity.satelliteOf?.name}{" "}
                  {romanize(entity.index + 1)}) | {entity.type} |{" "}
                  {(entity.radius / EARTH_RADIUS).toFixed(2)} Rₑ |{" "}
                  {entity.atmosphereRadius &&
                    (entity.atmosphereRadius / EARTH_RADIUS).toFixed(2) +
                      "Atmoₑ"}
                </PlanetButton>
                <ol type="I">
                  {entity.children.map((mEntity, index) => {
                    return (
                      <li key={mEntity.name}>
                        <PlanetButton>
                          {mEntity.name} ({entity.name} {romanize(index + 1)})
                        </PlanetButton>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )
          }}
        </ECS.Entities>
      </div>
      {/* <div>
        <h5>Planets / Moons</h5>
        <ECS.Entities entities={planets}>
          {entity => {
            return (
              <PlanetButton
                onClick={() => {
                  console.log("banana")
                  planets.forEach(_entity => {
                    if (_entity.name === entity.name) {
                      _entity.focused = true
                      return
                    }
                    _entity.focused = false
                  })
                }}
                style={{ color: entity.labelColor?.getStyle() }}
                focused={entity.focused}
              >
                {entity.name}
              </PlanetButton>
            )
          }}
        </ECS.Entities>
      </div> */}
    </div>
  )
}
