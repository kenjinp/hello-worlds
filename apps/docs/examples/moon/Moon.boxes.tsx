import { Controls } from "@game/player/KeyboardController"
import { useKeyboardControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { RigidBody, interactionGroups } from "@react-three/rapier"
import * as React from "react"
import { Color, Vector3 } from "three"
import { randFloat } from "three/src/math/MathUtils"

const SleepyBox: React.FC<{
  position: Vector3
  size: number
  density: number
  color: Color
}> = ({ position, size, density, color }) => {
  const [asleep, setSleepy] = React.useState(false)

  return (
    <RigidBody
      colliders="cuboid"
      position={position}
      density={density}
      collisionGroups={interactionGroups(5, [5, 0])}
      onSleep={() => {
        console.log("sleepy")
        setSleepy(true)
      }}
      onWake={() => {
        console.log("awake")
        setSleepy(false)
      }}
    >
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial wireframe={asleep} color={color} />
      </mesh>
    </RigidBody>
  )
}

export const ShootBoxes: React.FC = () => {
  const [boxes, setBoxes] = React.useState<
    {
      position: Vector3
      size: number
      density: number
      color: Color
    }[]
  >([])
  const camera = useThree(s => s.camera)

  const [subscribeKeys] = useKeyboardControls()

  React.useEffect(() => {
    const createBox = () => {
      const size = randFloat(1, 20)
      const density = size
      setBoxes([
        ...boxes,
        {
          position: camera.position,
          size,
          density,
          color: new Color(Math.random() * 0xffffff),
        },
      ])
    }

    return subscribeKeys(
      state => state[Controls.special],
      pressed => {
        pressed && createBox()
      },
    )
  }, [boxes])

  return (
    <>
      {boxes.map((box, index) => {
        return <SleepyBox key={`box-${index}`} {...box} />
      })}
    </>
  )
}
