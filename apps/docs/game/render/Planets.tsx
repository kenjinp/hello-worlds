import { ECS, world } from "@game/ECS"
import {
  archetypes,
  AstronomicalObjectProperties,
  PlanetProperties,
} from "@game/Entity"
import { CERES_RADIUS } from "@game/Math"
import {
  OrbitCamera,
  Planet as HelloPlanet,
  usePlanet,
} from "@hello-worlds/react"
import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
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

export const PlanetRender = React.forwardRef<
  Mesh,
  PlanetProperties & AstronomicalObjectProperties
>(
  (
    {
      position,
      radius = CERES_RADIUS,
      seed,
      focused,
      clouds,
      name,
      labelColor,
      planetType: type,
      children,
      seaLevel,
    },
    ref,
  ) => {
    const camera = useThree(store => store.camera)
    const entity = ECS.useCurrentEntity()

    const initialData = React.useMemo(
      () => ({
        seed,
        type,
        seaLevel,
      }),
      [],
    )

    return (
      <HelloPlanet
        ref={ref}
        position={position}
        // inverted
        radius={radius}
        minCellSize={32 * 8}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={initialData}
      >
        <Html>
          <i style={{ color: labelColor.getStyle() }}>{name}</i>
        </Html>
        {false && <OrbitCamera />}
        {/* <ChunkDebugger /> */}
        <EntityPlanetWrapper />
        <React.Suspense fallback={<meshStandardMaterial color="orange" />}>
          {/* <PlanetShadow /> */}
          <meshPhysicalMaterial
            vertexColors
            metalness={0}
            reflectivity={0.01}
          />
          {children}
        </React.Suspense>
      </HelloPlanet>
    )
  },
)

export const Planets: React.FC = () => {
  return (
    <ECS.Entities in={archetypes.planet}>
      {entity => {
        return (
          <ECS.Entity key={entity.id} entity={entity}>
            <mesh>
              <PlanetRender {...entity} children={[]} />

              {entity.children.map(moonEntity => (
                <mesh key={moonEntity.id} position={entity.position}>
                  {/* <Spinner {...moonEntity}> */}
                  <PlanetRender {...moonEntity} children={null} />
                  {/* </Spinner> */}
                </mesh>
              ))}
            </mesh>
          </ECS.Entity>
        )
      }}
    </ECS.Entities>
  )
}
