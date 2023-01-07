import { PointerLockCamera } from "@components/pointer-lock-camera/PointerLockCamera"
import { ECS, world } from "@game/ECS"
import { archetypes, Entity } from "@game/Entity"
import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { Object3D, Vector3 } from "three"

function getObjectProps<Entity, Key extends keyof Entity>(
  obj: Entity,
  key: Key,
): Entity[Key] {
  return obj[key]
}

// TODO fix types
export function useWatchComponent<T>(value: keyof Entity): T {
  const entity = ECS.useCurrentEntity()

  const [state, setState] = React.useState(getObjectProps(entity, value))

  // Do something better here
  useFrame(() => {
    if (getObjectProps(entity, value) !== state) {
      setState(getObjectProps(entity, value))
    }
  })
  return state
}

export const CurrentPlayer: React.FC = () => {
  const entity = ECS.useCurrentEntity()
  const [flyMode, setFlyMode] = React.useState(false)
  const camera = useThree(s => s.camera)
  const closestPlanet = useWatchComponent<Entity["closestAstronomicalObject"]>(
    "closestAstronomicalObject",
  )

  React.useEffect(() => {
    camera.position.copy(entity.position)
  }, [entity, camera])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f") {
        setFlyMode(!flyMode)
      }
    }
    document.body.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.removeEventListener("keydown", onKeyDown)
    }
  }, [flyMode])

  const { up, rotation, quaternion } = React.useMemo(() => {
    const up = closestPlanet
      ? closestPlanet.position.clone().sub(entity.position).negate().normalize()
      : new Vector3(0, 1, 0)

    const rotation = new Object3D()
    rotation.lookAt(up)
    rotation.rotateX(Math.PI / 2)

    return {
      up,
      rotation: rotation.rotation,
      quaternion: rotation.quaternion,
    }
  }, [closestPlanet, entity])

  React.useEffect(() => {
    if (flyMode) {
      world.removeComponent(entity, "affectedByGravity")
      world.addComponent(entity, "isFlyable", true)
      entity.velocity.set(0, 0, 0)
    } else {
      world.removeComponent(entity, "isFlyable")
      world.addComponent(entity, "affectedByGravity", true)
    }
    console.log("flyMode", flyMode, entity)
  }, [flyMode])

  return (
    <group rotation={rotation}>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
      <group position={new Vector3(5, 0, 5)}>
        <arrowHelper args={[up, new Vector3(), 2, 0xffff00, 1]} />
      </group>
      <PointerLockCamera up={quaternion} />
      {/* {flyMode ? (
        <FlyCamera />
      ) : (
        <>
          <PointerLockControls />
        </>
      )} */}
    </group>
  )
}

export const Player: React.FC = () => {
  const entity = ECS.useCurrentEntity()

  const isCurrentPlayer = entity.isCurrentPlayer

  return (
    <ECS.Component name="sceneObject">
      <group position={entity.position}>
        {isCurrentPlayer && <CurrentPlayer />}
      </group>
    </ECS.Component>
  )
}

export const Players: React.FC = () => {
  return (
    <>
      <ECS.Entities in={archetypes.player}>
        {entity => {
          return (
            <ECS.Entity key={entity.id} entity={entity}>
              <Player />
            </ECS.Entity>
          )
        }}
      </ECS.Entities>
      <ECS.Entities in={archetypes.currentPlayer}>
        {entity => {
          return (
            <ECS.Entity key={entity.id} entity={entity}>
              <Player />
            </ECS.Entity>
          )
        }}
      </ECS.Entities>
    </>
  )
}
