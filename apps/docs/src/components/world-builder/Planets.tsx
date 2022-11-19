import { Chunk as HelloChunk } from "@hello-worlds/planets"
import { Planet as HelloPlanet } from "@hello-worlds/react"
import { Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { useStore } from "statery"
import { Euler, Mesh, Object3D, Vector3 } from "three"
import { useTheme } from "./Theme"
import { Shadow } from "./vfx/materials/csm/Shadow"
import { CERES_RADIUS, MOON_DISTANCE, MOON_RADIUS } from "./WorldBuilder.math"
import { ECS, Planet, store, THEMES } from "./WorldBuilder.state"
import worker from "./WorldBuilder.worker"

const CastShadowBoys: React.FC<{
  speed: number
  radiusScale: Vector3
  orbitScale: Vector3
}> = ({ speed = 0.0005, orbitScale, radiusScale }) => {
  console.log({ orbitScale, radiusScale, speed })
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
        {sides.map(vec => {
          return (
            <mesh
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
        {sides.map(vec => {
          return (
            <mesh
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

// const MemoChunk = React.memo(CorrectedChunk)

// export const Clouds: React.FC<
//   Pick<Planet, "atmosphereRadius" | "radius" | "seed">
// > = ({ atmosphereRadius, radius, seed }) => {
//   const planetProps = React.useMemo(
//     () => ({
//       radius: (atmosphereRadius - radius) * 0.1 + radius,
//       minCellSize: 32 * 1000,
//       minCellResolution: 32,
//       invert: false,
//     }),
//     [radius, atmosphereRadius],
//   )
//   const initialData = React.useMemo(
//     () => ({
//       seed,
//       type: PlANET_TYPES.CLOUD,
//     }),
//     [],
//   )
//   const camera = useThree(store => store.camera)
//   const chunkData = React.useMemo(() => ({}), [])
//   return (
//     <HelloPlanet
//       planetProps={planetProps}
//       lodOrigin={camera.position}
//       worker={worker}
//       initialData={initialData}
//       data={chunkData}
//     >
//       <meshStandardMaterial
//         vertexColors
//         transparent
//         depthWrite={false}
//         side={DoubleSide}
//       />
//     </HelloPlanet>
//   )
// }

export const PlanetRender = React.forwardRef<Mesh, Planet>(
  (
    {
      position,
      radius = CERES_RADIUS,
      seed,
      focused,
      name,
      labelColor,
      type,
      // atmosphereRadius,
    },
    ref,
  ) => {
    const theme = useTheme()
    const isSynthwave = theme === THEMES.SYNTHWAVE

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
        minCellResolution={isSynthwave ? 16 : 32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={initialData}
      >
        <CastShadowBoys
          orbitScale={MOON_DISTANCE / 10}
          radiusScale={MOON_RADIUS}
        />
        <CastShadowBoys
          orbitScale={MOON_DISTANCE / 12}
          radiusScale={MOON_RADIUS / 10}
          speed={0.005}
        />
        <CastShadowBoys
          orbitScale={MOON_DISTANCE / 8}
          radiusScale={MOON_RADIUS / 20}
          speed={0.0025}
        />
        {/* <Instances
          material={new MeshStandardMaterial({ color: "green" })}
          geometry={new BoxBufferGeometry(100, 100, 100)}
        >
          <PlanetChunks>
            {chunk => (
              <CorrectedChunk key={chunk.uuid} chunk={chunk}>
                {chunk.width / chunk.resolution < 200 && (
                  <Rocks range={chunk.width} />
                )}
              </CorrectedChunk>
            )}
          </PlanetChunks>
        </Instances> */}
        {state.showPlanetLabels && (
          <Html>
            <i style={{ color: labelColor.getStyle() }}>{name}</i>
          </Html>
        )}
        {/* {!isSnythwave && atmosphereRadius && (
            <Clouds
              seed={seed}
              atmosphereRadius={atmosphereRadius}
              radius={radius}
            />
          )} */}
        {theme === THEMES.SYNTHWAVE ? (
          <meshStandardMaterial
            vertexColors
            wireframe
            wireframeLinewidth={2}
            emissive={labelColor}
            emissiveIntensity={1.1}
          />
        ) : (
          <React.Suspense fallback={<meshStandardMaterial color="orange" />}>
            <Shadow>
              <meshPhongMaterial vertexColors />
              {/* <Ground /> */}
            </Shadow>
          </React.Suspense>
        )}
        {/* <Ocean radius={radius} seaLevel={1000} /> */}
      </HelloPlanet>
    )
  },
)

export const Planets: React.FC = () => {
  return (
    <ECS.ManagedEntities tag="planet">
      {entity => {
        return (
          <ECS.Component name="mesh" key={entity.name}>
            <PlanetRender {...entity} />
          </ECS.Component>
        )
      }}
    </ECS.ManagedEntities>
  )
}
