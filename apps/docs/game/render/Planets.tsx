import { ECS, world } from "@game/ECS"
import { archetypes } from "@game/Entity"
import { CERES_RADIUS } from "@game/Math"
import {
  Planet as HelloPlanet,
  PlanetChunks,
  usePlanet,
} from "@hello-worlds/react"
import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Attractor } from "@react-three/rapier-addons"
import { ALTITUDE_RAYCAST_LAYER } from "hooks/useAltitude"
import * as React from "react"
import { Mesh } from "three"

const worker = () => new Worker(new URL("@game/Worker", import.meta.url))

export const EntityPlanetWrapper: React.FC = () => {
  const entity = ECS.useCurrentEntity()
  const planet = usePlanet()

  React.useEffect(() => {
    world.addComponent(entity, "helloPlanet", planet)
  }, [planet, entity])

  return null
}

function UpdateChunks() {
  return (
    <PlanetChunks>
      {chunk => {
        const geometry = chunk.geometry
        if (geometry) {
          geometry.attributes.uv2 = geometry.attributes.uv.clone()
        }
        return null
      }}
    </PlanetChunks>
  )
}

const PlanetPhysics: React.FC = () => {
  const entity = ECS.useCurrentEntity()
  return (
    <Attractor
      type="static"
      range={entity.radius * 1000}
      strength={100}
      position={entity.position}
    />
  )
}

export const PlanetRender = React.forwardRef<Mesh, React.PropsWithChildren<{}>>(
  ({ children }, ref) => {
    const camera = useThree(store => store.camera)
    const entity = ECS.useCurrentEntity()
    const {
      position,
      radius = CERES_RADIUS,
      seed,
      name,
      labelColor,
      planetType: type,
      seaLevel,
    } = entity

    const initialData = React.useMemo(
      () => ({
        seed,
        type,
        seaLevel,
      }),
      [],
    )

    return (
      <ECS.Component name="sceneObject">
        <HelloPlanet
          ref={p => {
            p?.layers.enable(ALTITUDE_RAYCAST_LAYER)
            if (ref) {
              ref.current = p
            }
          }}
          position={position}
          radius={radius}
          minCellSize={32 * 8}
          minCellResolution={32 * 2}
          lodOrigin={camera.position}
          worker={worker}
          data={initialData}
        >
          <Html>
            <h1 style={{ color: labelColor.getStyle() }}>{name}</h1>
          </Html>
          {/* <PlanetPhysics /> */}
          <EntityPlanetWrapper />
          <React.Suspense fallback={<meshStandardMaterial color="orange" />}>
            {/* <PlanetShadow /> */}
            <meshPhysicalMaterial
              vertexColors
              metalness={0}
              reflectivity={0.01}
            />
            {/* <PlanetTexture /> */}

            {children}
          </React.Suspense>
        </HelloPlanet>
      </ECS.Component>
    )
  },
)

export const Planets: React.FC = () => {
  return (
    <ECS.Entities in={archetypes.planet}>
      {entity => {
        return (
          <>
            <ECS.Entity key={entity.id} entity={entity}>
              <PlanetRender>
                {entity.children.map(moonEntity => (
                  <ECS.Entity key={moonEntity.id} entity={moonEntity}>
                    <mesh key={moonEntity.id} position={entity.position}>
                      <PlanetRender></PlanetRender>
                    </mesh>
                  </ECS.Entity>
                ))}
              </PlanetRender>
            </ECS.Entity>
          </>
        )
      }}
    </ECS.Entities>
  )
}
