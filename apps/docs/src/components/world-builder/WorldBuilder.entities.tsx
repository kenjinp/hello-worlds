import * as React from 'react';
import { Vector3 } from "three";
import { Planets } from './Planets';
import { Stars } from "./Stars";
import { AU, CERES_RADIUS, EARTH_RADIUS, MARS_RADIUS, MOON_DISTANCE, MOON_RADIUS, SUN_RADIUS } from "./WorldBuilder.math";
import { ECS } from "./WorldBuilder.state";

export const SunEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={new Vector3(-1, 0, 1).multiplyScalar(AU)} />
      <ECS.Component name="radius" data={SUN_RADIUS} />
      <ECS.Component name="star" />
      <ECS.Component name="color" data={0xffffff} />
      <ECS.Component name="emissive" data={0xffffff} />
      <ECS.Component name="intensity" data={0.8} />
      <ECS.Component name="name" data="Staritos" />
    </ECS.Entity>
  )
}

export const PlanetEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={new Vector3()} />
      <ECS.Component name="radius" data={EARTH_RADIUS} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={true} />
      <ECS.Component name="name" data="Planetos" />
    </ECS.Entity>
  )
}

export const MoonletEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={new Vector3(MOON_DISTANCE / 10, 0, MOON_DISTANCE / 10)} />
      <ECS.Component name="radius" data={CERES_RADIUS} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={false} />
      <ECS.Component name="name" data="Moonlet" />
    </ECS.Entity>
  )
}

export const MoonEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={new Vector3(MOON_DISTANCE / 2, 0, MOON_DISTANCE / 2)} />
      <ECS.Component name="radius" data={MOON_RADIUS} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={false} />
      <ECS.Component name="name" data="Lunatos" />
    </ECS.Entity>
  )
}

export const MoonEntity3: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={new Vector3(MOON_DISTANCE / 4, 0, MOON_DISTANCE / 4)} />
      <ECS.Component name="radius" data={MARS_RADIUS} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={false} />
      <ECS.Component name="name" data="Lunadue" />
    </ECS.Entity>
  )
}

export const RenderEntities: React.FC = () => {
  return (
    <>
      <SunEntity />
      <PlanetEntity />
      <MoonletEntity />
      <MoonEntity />
      <MoonEntity3 />
      <Stars />
      <Planets />
    </>
  );
}