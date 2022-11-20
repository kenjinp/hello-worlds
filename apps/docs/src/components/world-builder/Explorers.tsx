import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useOthers } from "@site/src/services/multiplayer"
import * as React from "react"
import { Color, Group, Mesh, Vector3 } from "three"
import { CERES_RADIUS } from "./WorldBuilder.math"
import { ECS, Explorer } from "./WorldBuilder.state"

const tempVector3 = new Vector3()

const SyncedPosition: React.FC<{ connectionId: number }> = ({
  connectionId,
}) => {
  const [position] = React.useState(tempVector3.set(0, 0, 0).clone())

  const [lastUpdateMeta] = React.useState<Explorer["lastUpdateMeta"]>({
    positions: [],
  })
  const others = useOthers()
  const { entities } = ECS.useArchetype("explorer")

  useFrame(({ clock }) => {
    others.map(user => {
      if (!user.presence?.position) {
        return
      }
      const explorer = entities.find(
        entity => entity.connectionId == connectionId,
      )
      if (explorer) {
        // TODO use this to implement a smoother lerping
        // if( lastUpdateMeta.positions.length > 1) {
        //   lastUpdateMeta.positions.shift();
        // }
        // lastUpdateMeta.positions.push(
        //   {
        //     time: clock.getElapsedTime(),
        //     position: tempVector3.set(user.presence.position.x, user.presence.position.y, user.presence.position.z).clone()
        //   }
        // )
        position.set(
          user.presence.position.x,
          user.presence.position.y,
          user.presence.position.z,
        )
      }
    })
  })

  return (
    <>
      <ECS.Component name="position" data={position} />
      <ECS.Component name="lastUpdateMeta" data={lastUpdateMeta} />
    </>
  )
}

export const ExplorerEntity: React.FC = () => {
  const others = useOthers()

  return (
    <>
      {others.map(user => {
        return user.presence ? (
          <ECS.Entity key={user.connectionId}>
            <ECS.Component name="explorer" />
            <SyncedPosition connectionId={user.connectionId} />
            <ECS.Component name="connectionId" data={user.connectionId} />
          </ECS.Entity>
        ) : null
      })}
    </>
  )
}

export const ExplorerRender = React.forwardRef<Mesh, Explorer>(
  ({ lastUpdateMeta, position, connectionId }, ref) => {
    const [randomColor] = React.useState(new Color(0xffffff * Math.random()))
    const reffer = React.useRef<Group>(null)

    useFrame((_, delta) => {
      if (!reffer.current) {
        return
      }
      // TODO Naughty lerp!
      reffer.current.position.lerp(position, delta * 10)
    })

    return (
      <group ref={reffer} position={position}>
        <Html>
          <b style={{ whiteSpace: "nowrap" }}>
            <i style={{ color: randomColor.getStyle() }}>
              Explorer {connectionId}
            </i>
          </b>
        </Html>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.75, 1]} />
          <meshStandardMaterial color={randomColor} />
        </mesh>
        <mesh ref={ref}>
          {/* <directionalLight color={randomColor} intensity={0.02} castShadow /> */}
          <sphereGeometry args={[CERES_RADIUS / 20, 32, 16]}></sphereGeometry>
          <meshStandardMaterial
            color={randomColor}
            emissive={randomColor}
            emissiveIntensity={20.0}
          />
        </mesh>
      </group>
    )
  },
)

export const Explorers: React.FC = () => {
  return (
    <ECS.ManagedEntities tag="explorer">
      {entity => {
        console.log("someone else is here!", { entity })
        return (
          <ECS.Component name="mesh" key={entity.connectionId}>
            <ExplorerRender {...entity} />
          </ECS.Component>
        )
      }}
    </ECS.ManagedEntities>
  )
}
