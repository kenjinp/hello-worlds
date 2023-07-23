import { Controls } from "@game/player/KeyboardController"
import { OrbitCamera } from "@hello-worlds/react"
import { useMouseCastToPlanetSurface } from "@hooks/useMouseCast"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { FC, useEffect, useRef, useState } from "react"
import { Mesh, Vector3 } from "three"
import { CharacterController } from "./Character/Character.controller"
import { Light } from "./Light"

export const MoonControls: FC = () => {
  const useDropRef = useRef<Mesh>(null)
  const getHitPoint = useMouseCastToPlanetSurface()
  const canvas = useThree(store => store.gl.domElement)
  const camera = useThree(store => store.camera)
  const [showDropper, setShowDropper] = useState(false)
  const [dropPoint, setDropPoint] = useState<Vector3 | null>(null)
  const [lastCameraPoint] = useState(new Vector3().copy(camera.position))
  const [subscribeKeys] = useKeyboardControls()

  useEffect(() => {
    return subscribeKeys(
      state => state[Controls.special],
      pressed => {
        if (!pressed) {
          return
        }
        console.log({ dropPoint, showDropper })
        if (!!dropPoint) {
          setDropPoint(null)
        }
        setShowDropper(!showDropper)
      },
    )
  }, [dropPoint, showDropper])

  useFrame(() => {
    const dropPosition = getHitPoint()
    if (!useDropRef.current || !dropPosition) {
      return
    }
    useDropRef.current.position.copy(dropPosition)
  })

  function handleDropPointClicked() {
    setDropPoint(useDropRef.current.position.clone())
    setShowDropper(false)
    lastCameraPoint.copy(camera.position)
  }

  useEffect(() => {
    if (!dropPoint) {
      setShowDropper(false)
    }
  }, [dropPoint])

  return (
    <>
      {dropPoint ? (
        <CharacterController initialPosition={dropPoint}>
          <Light />
        </CharacterController>
      ) : (
        <>
          {showDropper ? (
            <>
              <mesh ref={useDropRef} onClick={handleDropPointClicked}>
                <sphereGeometry args={[20, 20, 20]} />
                <meshBasicMaterial transparent opacity={0.4} color={"purple"} />
              </mesh>
            </>
          ) : (
            <OrbitCamera defaultCameraPosition={lastCameraPoint} />
          )}
        </>
      )}
    </>
  )
}
