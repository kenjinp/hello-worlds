import { Controls } from "@game/player/KeyboardController"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { FC, useEffect, useRef, useState } from "react"
import { MathUtils, PointLight } from "three"

export const Light: FC = () => {
  const [on, setOn] = useState(false)
  const lightRef = useRef<PointLight>()
  const targetIntensity = useRef<number>(0)
  const [subscribeKeys] = useKeyboardControls()

  useEffect(() => {
    targetIntensity.current = on ? 0.2 : 0
    console.log(targetIntensity.current)
  }, [on])

  useEffect(() => {
    return subscribeKeys(
      state => state[Controls.use],
      pressed => {
        pressed && setOn(!on)
      },
    )
  }, [on])

  useFrame(() => {
    if (!lightRef.current) {
      return
    }
    lightRef.current.intensity = MathUtils.lerp(
      lightRef.current.intensity,
      targetIntensity.current,
      0.2,
    )
  })

  return <pointLight ref={lightRef} distance={100} castShadow />
}
