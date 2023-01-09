import { Planet, RingWorldProps } from "@hello-worlds/planets"
import { RigidBodyApi } from "@react-three/rapier"
import { Strict, With } from "miniplex"
import { Color, Mesh, Object3D, Quaternion, Vector3 } from "three"
import { world } from "./ECS"
export type Tag = true

// Determine location based on this and timestamp
export type OrbitalCharacteristicProperties = {
  apogee: number //km
  perigee: number
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  parentIndex?: number
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
  cameraFollow?: boolean
  gravity?: number
}

export type Velocity = {
  velocity: Vector3
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

export enum PLANET_TYPES {
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
  helloPlanet?: Planet
  clouds?: Tag
  planet?: Tag
  moon?: Tag
  planetType: PLANET_TYPES
  atmosphereRadius?: number
  atmosphereDensity?: number
  seaLevel?: number
  isFocused: Tag
}

export type RingWorldProperties = {
  ringWorld: Tag
  length
  seed: string
  mesh?: Mesh
} & RingWorldProps<any>

export type PlayerProperties = {
  isPlayer: Tag
  isCurrentPlayer: Tag
  position: Vector3
  rotation: Quaternion
  lastUpdateMeta: {
    positions: {
      time: number
      position: Vector3
    }[]
  }
  connectionId: number
}

export type WindowProperties = {
  id: number | string
  window: Tag
  header?: string
  content?: React.ReactElement | string
  previewContent?: React.ReactElement | string
  previewing?: Tag
  headerColor?: string
  windowPosition?: { x: number; y: number }
  minimized?: Tag
  closed?: boolean
  style?: React.CSSProperties
  onClose: VoidFunction
  onMinimize: VoidFunction
  closable?: boolean
  zIndex?: number
  lastUpdated?: number
}

export type PhysicsBox = {
  isPhysicsBox: Tag
  mass: number
  position: Vector3
  color: Color
  size: number
}

export type Camera = {
  isCamera: Tag
}

export type Physics = {
  rigidBody: RigidBodyApi
}

export type AffectedByGravity = {
  affectedByGravity: Tag
}

export type TrackClosestAstronomicalObject = {
  closestAstronomicalObject: Entity | null
}

export type SceneObject = {
  sceneObject: Object3D
}

export type Flyable = {
  isFlyable: Tag
}

export type SyncPosition = {
  isFlyable: Tag
}

export type GodCamera = {
  isGodCameraTarget: Tag
  long: number
  lat: number
  target: Entity
  scale: number
}

// export type OrbitCamera = {
//   isOrbitCameraTarget: Tag
//   target: PlanetProperties
// }

export type Entity = Partial<
  OrbitalCharacteristicProperties &
    AstronomicalObjectProperties &
    ObjectProperties &
    StarProperties &
    PlanetProperties &
    RingWorldProperties &
    PlayerProperties &
    WindowProperties &
    PhysicsBox &
    Camera &
    SceneObject &
    TrackClosestAstronomicalObject &
    AffectedByGravity &
    Velocity &
    Flyable &
    GodCamera
  // OrbitCamera
>

export type Player = Strict<With<Entity, "isPlayer">>

/* Create some archetype queries: */
export const archetypes = {
  camera: world.archetype("isCamera", "sceneObject"),
  cameraFollow: world.archetype("cameraFollow", "sceneObject"),
  focusedPlanet: world.archetype("isFocused", "sceneObject"),
  godCameraNoTarget: world
    .archetype("isGodCameraTarget", "sceneObject")
    .without("target"),
  godCamera: world.archetype(
    "isGodCameraTarget",
    "long",
    "lat",
    "target",
    "sceneObject",
  ),
  flyable: world.archetype("velocity", "sceneObject", "isFlyable"),
  affectedByGravity: world.archetype(
    "affectedByGravity",
    "closestAstronomicalObject",
    "sceneObject",
    "velocity",
  ),
  trackingClosestAstroObject: world.archetype(
    "closestAstronomicalObject",
    "sceneObject",
  ),
  physics: world.archetype("velocity", "sceneObject"),
  star: world.archetype<
    StarProperties &
      AstronomicalObjectProperties &
      OrbitalCharacteristicProperties
  >("star"),
  planet: world.archetype("planet"),
  planetWithAtmosphere: world.archetype("radius", "atmosphereRadius"),
  planetWithOcean: world.archetype(
    "radius",
    "position",
    "seaLevel",
    "planetType",
  ),
  planetOrMoon: world.archetype("planetType"),
  moon: world.archetype("moon"),
  ringWorld: world.archetype("ringWorld"),
  player: world.archetype("isPlayer").without("isCurrentPlayer"),
  currentPlayer: world.archetype("isPlayer").with("isCurrentPlayer"),
  physicsBox: world.archetype("isPhysicsBox"),
  windows: world.archetype<WindowProperties>("window"),
  minimizedWindows: world
    .archetype<WindowProperties>("window", "minimized")
    .where(value => value.minimized === true),
}
