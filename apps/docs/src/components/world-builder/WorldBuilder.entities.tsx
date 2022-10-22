import * as React from "react"
import { Color, Vector3 } from "three"
import { match } from "ts-pattern"
import { ExplorerEntity, Explorers } from "./Explorers"
import { Planets } from "./Planets"
import { RingWorlds } from "./RingWorld"
import { Stars } from "./Stars"
import { useTheme } from "./Theme"
import {
  AU,
  CERES_RADIUS,
  EARTH_RADIUS,
  km,
  MARS_RADIUS,
  MOON_DISTANCE,
  MOON_RADIUS,
  SUN_RADIUS,
} from "./WorldBuilder.math"
import { ECS, PlANET_TYPES, THEMES } from "./WorldBuilder.state"

export const SunEntity: React.FC = () => {
  const theme = useTheme()

  return (
    <>
      {match(theme)
        .with(THEMES.HARD_SCIFI, theme => (
          <ECS.Entity key={theme}>
            <ECS.Component
              name="position"
              data={new Vector3(-1, 0, 1).multiplyScalar(AU)}
            />
            <ECS.Component name="radius" data={SUN_RADIUS} />
            <ECS.Component name="star" />
            <ECS.Component name="color" data={new Color(0xffffff)} />
            <ECS.Component name="emissive" data={0xffffff} />
            <ECS.Component name="intensity" data={0.4} />
            <ECS.Component name="name" data="Sun" />
          </ECS.Entity>
        ))
        .with(THEMES.SCI_FANTASY, theme => (
          <ECS.Entity key={theme}>
            <ECS.Component
              name="position"
              data={new Vector3(-1, 0, 1).multiplyScalar(AU).divideScalar(4)}
            />
            <ECS.Component name="radius" data={SUN_RADIUS} />
            <ECS.Component name="star" />
            <ECS.Component name="color" data={new Color(0x81cbf5)} />
            <ECS.Component name="emissive" data={new Color(0x81cbf5)} />
            <ECS.Component name="intensity" data={0.4} />
            <ECS.Component name="name" data="Sun" />
          </ECS.Entity>
        ))
        .with(THEMES.SYNTHWAVE, theme => (
          <ECS.Entity key={theme}>
            <ECS.Component
              name="position"
              data={new Vector3(-1, 0, 1).multiplyScalar(AU).divideScalar(10)}
            />
            <ECS.Component name="radius" data={SUN_RADIUS} />
            <ECS.Component name="star" />
            <ECS.Component name="color" data={new Color(0xffd319)} />
            <ECS.Component name="emissive" data={0xffd319} />
            <ECS.Component name="intensity" data={0.4} />
            <ECS.Component name="name" data="Sun" />
          </ECS.Entity>
        ))
        .run()}
    </>
  )
}

export const RedSunEntity: React.FC = () => {
  const theme = useTheme()
  const { position } = match(theme)
    .with(THEMES.HARD_SCIFI, () => ({
      position: new Vector3(-1.1, 0, 0.9).multiplyScalar(AU),
    }))
    .with(THEMES.SCI_FANTASY, () => ({
      position: new Vector3(-1.3, 0, 0.8).multiplyScalar(AU).divideScalar(4),
    }))
    .with(THEMES.SYNTHWAVE, () => ({
      position: new Vector3(-1.1, 0, 0.9).multiplyScalar(AU).divideScalar(10),
    }))
    .run()

  return (
    <ECS.Entity>
      <ECS.Component name="position" data={position} />
      <ECS.Component name="radius" data={SUN_RADIUS / 5} />
      <ECS.Component name="star" />
      <ECS.Component name="color" data={new Color(0xf15254)} />
      <ECS.Component name="emissive" data={0xf15254} />
      <ECS.Component name="intensity" data={0.1} />
      <ECS.Component name="name" data="Ruinos" />
    </ECS.Entity>
  )
}

export const PlanetEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component
        name="position"
        // TODO replace this with vector 0
        data={new Vector3()}
      />
      <ECS.Component name="atmosphereRadius" data={EARTH_RADIUS + 200_000} />
      <ECS.Component name="radius" data={EARTH_RADIUS} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={true} />
      <ECS.Component name="name" data="Aloth" />
      <ECS.Component name="type" data={PlANET_TYPES.TERRAN} />
      <ECS.Component name="labelColor" data={new Color(0x1b9acd)} />
    </ECS.Entity>
  )
}

export const RingEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component
        name="position"
        data={new Vector3(-80 * km, 0, -80 * km)}
      />
      <ECS.Component name="radius" data={20 * km} />
      <ECS.Component name="ringWorld" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={true} />
      <ECS.Component name="name" data="Alothirand" />
      <ECS.Component name="length" data={100 * km} />
      <ECS.Component name="labelColor" data={new Color(0x1b9acd)} />
    </ECS.Entity>
  )
}

export const RingEntity2Test: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={new Vector3(80 * km, 0, 80 * km)} />
      <ECS.Component name="radius" data={80 * km} />
      <ECS.Component name="ringWorld" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={true} />
      <ECS.Component name="name" data="Cycler" />
      <ECS.Component name="length" data={20 * km} />
      <ECS.Component name="labelColor" data={new Color(0x1b9acd)} />
    </ECS.Entity>
  )
}

export const RingEntity2: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={new Vector3(0, 0, 0)} />
      <ECS.Component name="radius" data={EARTH_RADIUS * 3} />
      <ECS.Component name="ringWorld" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={true} />
      <ECS.Component name="name" data="Cycler" />
      <ECS.Component name="length" data={50 * km} />
      <ECS.Component name="labelColor" data={new Color(0x1b9acd)} />
    </ECS.Entity>
  )
}

export const NivenWorld: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component
        name="position"
        data={new Vector3(-1, 0, 1).multiplyScalar(AU)}
      />
      <ECS.Component name="radius" data={1.02 * AU} />
      <ECS.Component name="ringWorld" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={true} />
      <ECS.Component name="name" data="Nivenring" />
      <ECS.Component name="length" data={125.8 * 2 * EARTH_RADIUS} />
      <ECS.Component name="labelColor" data={new Color(0x1b9acd)} />
    </ECS.Entity>
  )
}

export const MoonletEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component
        name="position"
        data={new Vector3(MOON_DISTANCE / 10, 0, MOON_DISTANCE / 10)}
      />
      <ECS.Component name="radius" data={CERES_RADIUS} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={false} />
      <ECS.Component name="name" data="Xabos" />
      <ECS.Component name="labelColor" data={new Color(0x8dd98f)} />
    </ECS.Entity>
  )
}

export const DinkyMoonletEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component
        name="position"
        data={new Vector3(MOON_DISTANCE / 20, 0, MOON_DISTANCE / 20)}
      />
      <ECS.Component name="radius" data={CERES_RADIUS / 5} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={false} />
      <ECS.Component name="name" data="Mahiri" />
      <ECS.Component name="type" data={PlANET_TYPES.DWARF} />
      <ECS.Component name="labelColor" data={new Color(0xf1bd46)} />
    </ECS.Entity>
  )
}

export const MoonEntity: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component
        name="position"
        data={new Vector3(MOON_DISTANCE / 2, 0, MOON_DISTANCE / 2)}
      />
      <ECS.Component name="radius" data={MOON_RADIUS} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={false} />
      <ECS.Component name="name" data="Thoulea" />
      <ECS.Component name="labelColor" data={new Color(0xb241e4)} />
    </ECS.Entity>
  )
}

export const MoonEntity3: React.FC = () => {
  return (
    <ECS.Entity>
      <ECS.Component
        name="position"
        data={new Vector3(MOON_DISTANCE, 0, MOON_DISTANCE)}
      />
      <ECS.Component name="radius" data={MARS_RADIUS} />
      <ECS.Component name="atmosphereRadius" data={MARS_RADIUS + 40_000} />
      <ECS.Component name="planet" />
      <ECS.Component name="seed" data="hello-worlds" />
      <ECS.Component name="focused" data={false} />
      <ECS.Component name="name" data="Cahowei" />
      <ECS.Component name="labelColor" data={new Color(0xd0231f)} />
    </ECS.Entity>
  )
}

export const RenderEntities: React.FC = () => {
  return (
    <>
      {/* Add data to the scene */}
      <ExplorerEntity />
      <SunEntity />
      <RedSunEntity />

      {/* <PlanetEntity /> */}
      <RingEntity />
      <RingEntity2Test />
      {/* <RingEntity2 /> */}
      {/* <NivenWorld /> */}
      {/* <DinkyMoonletEntity />
      <MoonletEntity />
      <MoonEntity />
      <MoonEntity3 /> */}

      {/* Render them */}
      <Stars />
      <Planets />
      <Explorers />
      <RingWorlds />
    </>
  )
}
