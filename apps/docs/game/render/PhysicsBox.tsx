import { ECS, world } from "@game/ECS"
import { archetypes } from "@game/Entity"
import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Color, Mesh } from "three"
import { randInt } from "three/src/math/MathUtils"

export const PhysicsBoxRender = React.forwardRef<Mesh>((props, ref) => {
  const { position, color, size, mass } = ECS.useCurrentEntity()
  return (
    <ECS.Component name="rigidBody">
      <RigidBody colliders="ball" position={position} mass={mass}>
        <ECS.Component name="sceneObject">
          <mesh ref={ref}>
            <sphereGeometry args={[size, 32, 16]} />
            <meshStandardMaterial color={color} />
            <Html>
              <span>{size} m r</span>
            </Html>
          </mesh>
        </ECS.Component>

        {/* <Attractor
        type="linear"
        strength={1}
        range={size * 100}
        // collisionGroups={interactionGroups(1, 2)}
      ></Attractor> */}
      </RigidBody>
    </ECS.Component>
  )
})

export const ShootBoxes: React.FC = () => {
  const { entities } = useEntities(archetypes.currentPlayer)
  const camera = useThree(s => s.camera)
  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "t") {
        const player = entities[0]
        world.add({
          affectedByGravity: true,
          closestAstronomicalObject: null,
          velocity: player.velocity,
          isPhysicsBox: true,
          position: camera.position,
          size: randInt(2, 20),
          mass: randInt(0.5, 10),
          color: new Color(Math.random() * 0xffffff),
        })
      }
    }
    document.addEventListener("keydown", listener)
    return () => {
      document.removeEventListener("keydown", listener)
    }
  }, [])

  return null
}

export const PhysicsBoxes: React.FC = () => {
  return (
    <>
      <ShootBoxes />
      <ECS.Entities in={archetypes.physicsBox}>
        <PhysicsBoxRender />
      </ECS.Entities>
    </>
  )
}
