import { Planet as HelloPlanet } from "@hello-worlds/react/dist/esm/planets/Planets"
import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { useStore } from "statery"
import { DoubleSide, Mesh } from "three"
import FlyCamera from "../cameras/FlyCamera"
import { useTheme } from "./Theme"
import { CERES_RADIUS } from "./WorldBuilder.math"
import { ECS, Planet, PlANET_TYPES, store, THEMES } from "./WorldBuilder.state"
import worker from "./WorldBuilder.worker"


export const Clouds: React.FC<
  Pick<Planet, "atmosphereRadius" | "radius" | "seed">
> = ({ atmosphereRadius, radius, seed }) => {
  const planetProps = React.useMemo(
    () => ({
      radius: (atmosphereRadius - radius) * 0.1 + radius,
      minCellSize: 32 * 1000,
      minCellResolution: 32,
      invert: false,
    }),
    [radius, atmosphereRadius],
  )
  const initialData = React.useMemo(
    () => ({
      seed,
      type: PlANET_TYPES.CLOUD,
    }),
    [],
  )
  const camera = useThree(store => store.camera)
  const chunkData = React.useMemo(() => ({}), [])
  return (
    <HelloPlanet
      planetProps={planetProps}
      lodOrigin={camera.position}
      worker={worker}
      initialData={initialData}
      data={chunkData}
    >
      <meshStandardMaterial
        vertexColors
        transparent
        depthWrite={false}
        side={DoubleSide}
      />
    </HelloPlanet>
  )
}

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
      atmosphereRadius,
    },
    ref,
  ) => {
    const theme = useTheme()
    const isSnythwave = theme === THEMES.SYNTHWAVE

    const camera = useThree(store => store.camera)
    const planetProps = React.useMemo(
      () => ({
        radius: radius,
        minCellSize: 32 * 8,
        minCellResolution: isSnythwave ? 16 : 32 * 2,
        invert: false,
      }),
      [radius, isSnythwave],
    )

    const initialData = React.useMemo(
      () => ({
        seed,
        type,
      }),
      [],
    )
    const chunkData = React.useMemo(() => ({}), [])
    const state = useStore(store)

    return (
      <mesh ref={ref} position={position}>
        <HelloPlanet
          planetProps={planetProps}
          lodOrigin={camera.position}
          worker={worker}
          initialData={initialData}
          data={chunkData}
        >
          {focused && <FlyCamera />}
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
            <meshStandardMaterial vertexColors />
          )}
        </HelloPlanet>
      </mesh>
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
