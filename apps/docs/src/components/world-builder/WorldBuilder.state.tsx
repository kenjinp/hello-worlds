import { RingWorldProps } from "@hello-worlds/planets"
import { Strict, With } from "miniplex"
import { makeStore } from "statery"
import { Color, Mesh, Vector3 } from "three"
import { world } from "./WorldBuilder.ecs"
export type Tag = true

export enum THEMES {
  SCI_FANTASY = "sci-fantasy",
  HARD_SCIFI = "hard-scifi",
  SYNTHWAVE = "synthwave",
}

export type Theme = {
  theme: THEMES
}

export const store = makeStore({
  theme: THEMES.SCI_FANTASY,
  screenshotMode: false,
  showPlanetLabels: true,
  debugMode: false,
})

// Determine location based on this and timestamp
export type OrbitalCharacteristicProperties = {
  apogee: number //km
  perigee: number
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  orbitalPeriod: number // in days maybe
  satelliteOf?: Entity // everything is a satelite of something?
  axialTilt: number // by plane of the ecliptic or y = 0
  rotationPeriod: number //day
}

export type AstronomicalObjectProperties = {
  id: number | string
  index?: number
  radius: number
  children: Entity[]
  name: string
  labelColor: Color
  mesh?: Mesh
}

export type ObjectProperties = {
  mesh?: Mesh
  position: Vector3
}

export type StarProperties = {
  star: Tag
  seed: string
  color: Color
  emissive: Color
  lightIntensity: number
}

export enum PlANET_TYPES {
  TERRAN = "TERRAN",
  DWARF = "DWARF",
  LUNAR = "LUNAR",
  AREAN = "AREAN",
  VULCAN = "VULCAN",
  CLOUD = "CLOUD",
  OCEAN = "OCEAN",
  STRANGE = "STRANGE",
}

export type PlanetProperties = {
  radius: number
  seed: string
  planet?: Tag
  moon?: Tag
  planetType: PlANET_TYPES
  atmosphereRadius?: number
  atmosphereDensity?: number
}

export type RingWorldProperties = {
  ringWorld: Tag
  length
  seed: string
  mesh?: Mesh
  focused?: boolean
} & RingWorldProps<any>

export type ExplorerProperties = {
  explorer: Tag
  position: Vector3
  lastUpdateMeta: {
    positions: {
      time: number
      position: Vector3
    }[]
  }
  connectionId: number
}

export type Entity = Partial<
  OrbitalCharacteristicProperties &
    AstronomicalObjectProperties &
    ObjectProperties &
    StarProperties &
    PlanetProperties &
    RingWorldProperties &
    ExplorerProperties
>

export type Player = Strict<With<Entity, "explorer">>

/* Create some archetype queries: */
export const archetypes = {
  star: world.archetype<
    StarProperties &
      AstronomicalObjectProperties &
      OrbitalCharacteristicProperties
  >("star"),
  planet: world.archetype("planet"),
  planetOrMoon: world.archetype("planetType"),
  moon: world.archetype("moon"),
  ringWorld: world.archetype("ringWorld"),
  player: world.archetype("explorer"),
}
