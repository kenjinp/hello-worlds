import { GodCamera } from "@game/cameras/GodCamera"
import { ECS, world } from "@game/ECS"
import { archetypes } from "@game/Entity"
import { CERES_RADIUS } from "@game/Math"
import { Chunk as HelloChunk } from "@hello-worlds/planets"
import {
  Planet as HelloPlanet,
  PlanetChunks,
  usePlanet
} from "@hello-worlds/react"
import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Attractor, RigidBody } from "@react-three/rapier"
import * as React from "react"
import { Mesh, Object3D } from "three"

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

export const CorrectedChunkTranslation: React.FC<{
  chunk: HelloChunk
}> = ({ chunk, children }) => {
  const pos = React.useMemo(() => {
    chunk.geometry.computeBoundingBox()
    return (
      chunk.position
        .clone()
        // .add(chunk.offset)
        .applyMatrix4(chunk.group.matrixWorld)
    )
  }, [chunk.uuid])

  const rot = React.useMemo(() => {
    const rotationobj = new Object3D()
    rotationobj.position.copy(pos)
    rotationobj.applyMatrix4(chunk.group.matrixWorld)
    return rotationobj.rotation
  }, [pos])

  return (
    <group key={chunk.uuid} position={pos} rotation={rot}>
      {/* <RigidBody colliders="trimesh"></RigidBody> */}
      {/* <Html>chunk: {chunk.uuid}</Html> */}
      {/* <box3Helper
      position={position}
      rotation={chunk.rotation}
      args={[
        chunk.geometry.boundingBox,
        new Color(Math.random() * 0xffffff),
      ]}
    /> */}
      {children}
    </group>
  )
}
//     {/*
// <PlanetChunks>
//   {chunk => (
//     <RigidBody key={chunk.uuid} mass={0}>
//       {/* <MeshCollider type="trimesh"> */}
//       <CorrectedChunkTranslation chunk={chunk}>
//         <bufferGeometry attach="geometry" {...chunk.geometry} />
//         <meshBasicMaterial wireframe color="red" />
//       </CorrectedChunkTranslation>
//       {/* </MeshCollider> */}
//     </RigidBody>
//   )}
// </PlanetChunks>
//   */
//  }

const PlanetChunkColliders = () => {
  return (
    <PlanetChunks>
      {chunk => {
        return (
          <CorrectedChunkTranslation key={chunk.uuid} chunk={chunk}>
            <RigidBody mass={0} includeInvisible colliders="trimesh">
              <mesh>
                {/* <bufferGeometry>
              <bufferAttribute
                attach="attributes-position" // <- new attributes attach
                count={
                  chunk.geometry.attributes.positions.array.length / 3
                }
                array={chunk.geometry.attributes.positions.array}
                itemSize={3}
              />
              {/* <bufferAttribute
              attach="attributes-position" // <- new attributes attach
              count={chunk.geometry.attributes.positions.array.length / 3} array={chunk.geometry.attributes.positions.array} itemSize={3}

            />
            // </bufferGeometry> */}
                <bufferGeometry attach="geometry" {...chunk.geometry} />
                <meshBasicMaterial wireframe color="red" visible={false} />
              </mesh>
            </RigidBody>
          </CorrectedChunkTranslation>
        )
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
      isFocused,
      clouds,
      gravity,
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
          {isFocused && <GodCamera initialLatLong={[0, 90]} />}
          <Html>
            <i style={{ color: labelColor.getStyle() }}>{name}</i>
          </Html>
          {/* <PlanetPhysics /> */}
          {/* {false && <OrbitCamera />} */}
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
      </ECS.Component>
    )
  },
)

export const Planets: React.FC = () => {
  return (
    <ECS.Entities in={archetypes.planet}>
      {entity => {
        return (
          <ECS.Entity key={entity.id} entity={entity}>
            <>
              <PlanetRender />

              {entity.children.map(moonEntity => (
                <ECS.Entity key={moonEntity.id} entity={moonEntity}>
                  <mesh key={moonEntity.id} position={entity.position}>
                    <PlanetRender />
                  </mesh>
                </ECS.Entity>
              ))}
            </>
          </ECS.Entity>
        )
      }}
    </ECS.Entities>
  )
}
