import { PerspectiveCamera } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { usePlanet } from "@site/../../packages/react/dist/esm"
import * as React from "react"
import { MathUtils, Mesh, Vector2, Vector3 } from "three"
import { useControls } from "../../hooks/useControls"

const DEFAULT_SENSITIVITY = new Vector2(1, 0.8)
const DEFAULT_OFFSET = new Vector3(0, 1, 0)

export const GodCamera: React.FC<{
  offset?: Vector3
  sensitivity?: Vector2
}> = ({ offset = DEFAULT_OFFSET, sensitivity = DEFAULT_SENSITIVITY }) => {
  const [_position, setPosition] = React.useState(new Vector3())
  const planet = usePlanet()
  const { camera } = useThree()
  const maxPitchAngle = 89
  const minPitchAngle = -89
  const pitchObjectRef = React.useRef<Mesh>(null)
  const yawObjectRef = React.useRef<Mesh>(null)
  const controls = useControls()

  React.useEffect(() => {
    // TODO this should be ACTUAL HEIGHT + a value
    setPosition(
      _position
        .set(
          planet.planetProps.radius * 1.005,
          0,
          planet.planetProps.radius * 1.005,
        )
        .clone(),
    )
    console.log(_position)
  }, [planet.planetProps.radius])

  useFrame(() => {
    yawObjectRef.current?.position.copy(offset)
    if (pitchObjectRef.current && yawObjectRef.current) {
      const pitchObject = pitchObjectRef.current
      const yawObject = yawObjectRef.current

      const update = () => {
        const getLook = () => controls.mouse.move()
        const getZoom = () => controls.mouse.scroll()

        console.log(getZoom())

        if (controls.mouse.isPointerLocked()) {
          const { x, y } = getLook()

          // Pitch
          const maxAngleRads = MathUtils.degToRad(maxPitchAngle)
          const minAngleRads = MathUtils.degToRad(minPitchAngle)
          pitchObject.rotation.x -= y / (1000 / sensitivity.y)

          if (pitchObject.rotation.x > maxAngleRads) {
            pitchObject.rotation.x = maxAngleRads
          } else if (pitchObject.rotation.x < minAngleRads) {
            pitchObject.rotation.x = minAngleRads
          }

          // Yaw
          yawObject.rotation.y -= x / (1000 / sensitivity.x)
        }
      }
      update()
    }
  })

  return (
    <group position={_position}>
      <mesh ref={yawObjectRef}>
        <mesh ref={pitchObjectRef}>
          <PerspectiveCamera
            name="FirstPersonCamera"
            makeDefault
            far={100_000_000}
          />
        </mesh>
      </mesh>
    </group>
  )
}
