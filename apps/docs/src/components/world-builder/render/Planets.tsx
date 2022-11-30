import { Chunk as HelloChunk, remap } from "@hello-worlds/planets"
import { Planet as HelloPlanet } from "@hello-worlds/react"
import { Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { useStore } from "statery"
import { Euler, Mesh, Object3D, Vector3 } from "three"
import { ECS } from "../WorldBuilder.ecs"
import { CERES_RADIUS, MOON_DISTANCE } from "../WorldBuilder.math"
import {
  archetypes,
  AstronomicalObjectProperties,
  PlanetProperties,
  store,
} from "../WorldBuilder.state"
import worker from "../WorldBuilder.worker"

const Spinner: React.FC<React.PropsWithChildren<PlanetProperties>> = ({
  children,
  position,
}) => {
  const ref = React.useRef<Mesh>(null)
  const dis = new Vector3().distanceTo(position)
  const speed = 0.00006 - remap(dis, 0, MOON_DISTANCE, 0.0000005, 0.00005)

  console.log({ dis, speed })

  useFrame(() => {
    if (!ref.current) {
      return
    }
    ref.current.rotation.y += speed
  })

  return <mesh ref={ref}>{children}</mesh>
}

const CastShadowBoys: React.FC<{
  speed: number
  radiusScale: Vector3
  orbitScale: Vector3
}> = ({ speed = 0.0005, orbitScale, radiusScale }) => {
  const ref1 = React.useRef<Mesh>(null)
  const ref2 = React.useRef<Mesh>(null)

  const sides = [
    new Vector3(1, 0, 1).multiplyScalar(orbitScale),
    new Vector3(-1, 0, 1).multiplyScalar(orbitScale),
    new Vector3(1, 0, -1).multiplyScalar(orbitScale),
    new Vector3(-1, 0, -1).multiplyScalar(orbitScale),
  ]

  useFrame(() => {
    if (!ref1.current || !ref2.current) {
      return
    }
    ref1.current.rotation.y += speed
    ref2.current.rotation.y += speed
  })

  return (
    <group>
      <mesh ref={ref1}>
        {sides.map((vec, i) => {
          return (
            <mesh
              key={`this-way-${i}`}
              position={vec}
              scale={new Vector3(radiusScale, radiusScale, radiusScale)}
              castShadow
              receiveShadow
            >
              <sphereGeometry />
              <meshStandardMaterial color="purple" />
            </mesh>
          )
        })}
      </mesh>
      <mesh ref={ref2} rotation={new Euler(1, (Math.PI / 2) * 180, 1)}>
        {sides.map((vec, i) => {
          return (
            <mesh
              key={`that-way-${i}`}
              position={vec}
              scale={new Vector3(radiusScale, radiusScale, radiusScale)}
              castShadow
              receiveShadow
            >
              <sphereGeometry />
              <meshStandardMaterial color="purple" />
            </mesh>
          )
        })}
      </mesh>
    </group>
  )
}

export const CorrectedChunk: React.FC<{
  chunk: HelloChunk
}> = ({ chunk, children }) => {
  const pos = React.useMemo(
    () =>
      chunk.geometry.boundingBox
        .getCenter(new Vector3())
        .applyMatrix4(chunk.group.matrixWorld),
    [chunk.uuid],
  )

  const rot = React.useMemo(() => {
    const rotationobj = new Object3D()
    rotationobj.position.copy(pos)
    rotationobj.lookAt(chunk.position)
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

export const PlanetRender = React.forwardRef<
  Mesh,
  PlanetProperties & AstronomicalObjectProperties
>(
  (
    { position, radius = CERES_RADIUS, seed, focused, name, labelColor, type },
    ref,
  ) => {
    const camera = useThree(store => store.camera)

    const initialData = React.useMemo(
      () => ({
        seed,
        type,
      }),
      [],
    )
    const state = useStore(store)

    return (
      <HelloPlanet
        ref={ref}
        position={position}
        radius={radius}
        minCellSize={32 * 8}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={initialData}
      >
        {state.showPlanetLabels && (
          <Html>
            <i style={{ color: labelColor.getStyle() }}>{name}</i>
          </Html>
        )}

        <React.Suspense fallback={<meshStandardMaterial color="orange" />}>
          {/* <PlanetShadow /> */}
          <meshPhongMaterial vertexColors />
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
          <mesh>
            <PlanetRender {...entity} />
            {entity.children.map(moonEntity => (
              <mesh key={moonEntity.id} position={entity.position}>
                <Spinner {...moonEntity}>
                  <PlanetRender {...moonEntity} />
                </Spinner>
              </mesh>
            ))}
          </mesh>
        )
      }}
    </ECS.Entities>
  )
}
