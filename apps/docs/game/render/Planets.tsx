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

// const WeeBoat: React.FC = () => {
//   const entity = ECS.useCurrentEntity()
//   const meshRef = React.useRef<Mesh>(null)
//   const [position] = React.useState(
//     randomSpherePointVector3(
//       new Vector3(),
//       entity.radius + entity.seaLevel + 5,
//     ),
//   )

//   React.useEffect(() => {
//     if (!meshRef.current) return
//     meshRef.current.lookAt(entity.position)
//     // meshRef.current.rotation.set(new Vector3(0, 0, Math.PI / 2))
//     meshRef.current.rotateX((Math.PI / 2) * 3)
//     // getDirectionFromSphere(meshRef.current, entity.position)
//     // orientMeshFromSphere(meshRef.current, entity.position)
//     // meshRef.current.rotation.set(new Vector3(0, 0, Math.PI / 2))
//     // convertMeshToYUp(meshRef.current)
//   }, [meshRef, entity])

//   return (
//     <group position={position}>
//       <mesh ref={meshRef}>
//         {/* <cylinderGeometry
//           args={[
//             (entity.radius / 100) * 0.95,
//             entity.radius / 100,
//             entity.radius / 10,
//             32,
//           ]}
//         />
//         <meshBasicMaterial color="red" opacity={0.1} /> */}
//         <Boat />
//       </mesh>
//       <Html style={{ color: "white" }}>
//         <i>Boat :)</i>
//       </Html>
//     </group>
//   )
// }

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
                <ECS.Entity key={moonEntity.id} entity={moonEntity}>
                  <mesh key={moonEntity.id} position={entity.position}>
                    {/* <Spinner {...moonEntity}> */}
                    <PlanetRender {...moonEntity} children={null} />
                    {/* </Spinner> */}
                  </mesh>
                </ECS.Entity>
              ))}
            </mesh>
          </ECS.Entity>
        )
      }}
    </ECS.Entities>
  )
}
