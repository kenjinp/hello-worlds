import { Planet as HelloPlanet } from "@hello-worlds/react/dist/esm/planets/Planets"
import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { OrbitCamera } from "@site/../../packages/react/dist/esm"
import * as React from "react"
import { useStore } from "statery"
import { Mesh } from "three"
import { useTheme } from "./Theme"
import { Atmosphere } from "./vfx/atmosphere/Atmoshpere"
import { CERES_RADIUS } from "./WorldBuilder.math"
import { ECS, Planet, store, THEMES } from "./WorldBuilder.state"
import worker from "./WorldBuilder.worker"

export const PlanetRender = React.forwardRef<Mesh, Planet>(
  (
    { position, radius = CERES_RADIUS, seed, focused, name, labelColor, type },
    ref,
  ) => {
    const theme = useTheme()

    const { camera } = useThree()
    const planetProps = React.useMemo(
      () => ({
        radius: radius,
        minCellSize: 32 * 8,
        minCellResolution: theme === THEMES.SYNTHWAVE ? 16 : 32 * 2,
        invert: false,
      }),
      [radius],
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
          {focused && <OrbitCamera />}
          <Atmosphere />
          {state.showPlanetLabels && (
            <Html>
              <i style={{ color: labelColor.getStyle() }}>{name}</i>
            </Html>
          )}
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
