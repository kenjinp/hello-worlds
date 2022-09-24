import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import * as THREE from "three"
import { ECS } from "../../state/ecs"

export const RenderPlayers: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { entities } = ECS.useArchetype("playerId", "position", "rotation")

  return (
    <>
      {entities.map(({ playerId, position, rotation }) => {
        return (
          <Player key={playerId} position={position} rotation={rotation}>
            {children}
          </Player>
        )
      })}
    </>
  )
}

const Player = React.forwardRef<
  THREE.Mesh,
  React.PropsWithChildren<{
    position: THREE.Vector3
    rotation: THREE.Quaternion
  }>
>(({ children, position, rotation }, ref) => {
  const { camera } = useThree()
  const controlRef = React.useRef()

  React.useEffect(() => {
    if (controlRef.current) {
      camera.up.copy(position.clone().negate())
      // controlRef.current.target.copy(position);
    }
  }, [controlRef.current])

  return (
    <mesh ref={ref} position={position} quaternion={rotation}>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="white" />
      <Html>
        <h2>Player</h2>
      </Html>
      {children}
      <axesHelper position={camera.up} />
      <axesHelper scale={new THREE.Vector3(4, 4, 4)} />
    </mesh>
  )
})

export default Player
