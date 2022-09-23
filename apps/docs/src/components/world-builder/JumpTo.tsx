
import * as React from 'react';


import styled from "styled-components";
import { ECS } from './WorldBuilder.state';

export const PlanetButton = styled.button`
  border-radius: 0.5em;
  padding: 0.5em 1em 0.5em;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: bold;
  color: #f4f4f4;
  &:hover, &.focused {
    background: #dd3cff9c;
    color: #f4f4f4;
    background: #2f2f2f;
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  }
`;

export const PlanetIcon = styled.div`
  border-radius: 0.5em;
  padding: 0.5em 1em 0.5em;
  background: transparent;
  border: 0;
  cursor: pointer;
  
  ${props => props.focused && `
    background: #dd3cff9c;
    color: pink;
    background: #2f2f2f;
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);`
  }
  
  &:hover {
    background: #dd3cff9c;
    color: #f4f4f4;
    background: #2f2f2f;
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  }
`;

export const JumpTo: React.FC = () => {
  const { entities: planets } = ECS.useArchetype("planet")
  const { entities: stars } = ECS.useArchetype("star")
  return (
    <div>
      <div style={{ marginBottom: '1em'}}>
      <h5>Stars</h5>
      <ECS.Entities entities={stars}>
      {(entity) => {
        return (
          <PlanetButton >{entity.name}</PlanetButton>
        )
      }}
    </ECS.Entities>
      </div>
      <div>

      <h5>Planets / Moons</h5>
    <ECS.Entities entities={planets}>
      {(entity) => {
        return (
          <PlanetButton 
          
            onClick={() => {
              console.log("banana")
              planets.forEach(_entity => {
                if (_entity.name === entity.name) {
                  _entity.focused = true;
                  return;
                }
                _entity.focused = false;
              })
            }}
          style={{ color: entity.labelColor?.getStyle() }} focused={entity.focused}>{entity.name}</PlanetButton>
        )
      }}
    </ECS.Entities>
    </div>
    </div>
  )
}