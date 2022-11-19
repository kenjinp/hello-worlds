import { useThree } from "@react-three/fiber"
import * as React from "react"
import { DirectionalLight, Mesh, PerspectiveCamera } from "three"
import { SUN_RADIUS } from "./WorldBuilder.math"
import { ECS, Star } from "./WorldBuilder.state"

export const StarRender = React.forwardRef<Mesh, Star>(
  (
    { position, radius = SUN_RADIUS, color, emissive, lightIntensity, name },
    ref,
  ) => {
    console.log("star render!", { position, color })
    const lightRef = React.useRef<DirectionalLight>(null)
    const camera = useThree(s => s.camera) as PerspectiveCamera

    React.useEffect(() => {
      const light = lightRef.current
      if (!light) {
        return
      }
      // light.shadow.camera.up.set(0, 0, 1)
      // light.shadow.camera.near = camera.near
      // light.shadow.camera.far = camera.far
      // light.shadow.camera.right = 100
      // light.shadow.camera.left = -100
      // light.shadow.camera.top = 100
      // light.shadow.camera.bottom = -100
      // light.shadow.mapSize.width = 1024
      // light.shadow.mapSize.height = 1024
    }, [lightRef])

    return (
      <mesh ref={ref} position={position}>
        <directionalLight
          ref={lightRef}
          color={emissive}
          intensity={lightIntensity}
          // castShadow
          name={`${name}-light`}
        />
        <sphereGeometry args={[radius, 32, 16]}></sphereGeometry>
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={40.0}
        />
      </mesh>
    )
  },
)

export const Stars: React.FC = () => {
  return (
    <ECS.ManagedEntities tag="star">
      {entity => {
        console.log({ sun: entity })
        return (
          <ECS.Component name="mesh" key={entity.name}>
            <StarRender {...entity} />
          </ECS.Component>
        )
      }}
    </ECS.ManagedEntities>
  )
}
