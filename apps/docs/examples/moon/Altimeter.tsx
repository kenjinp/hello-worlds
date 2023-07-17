import { useFrame, useThree } from "@react-three/fiber"
import { FC, useRef, useState } from "react"
import { Vector3 } from "three"
import { UITunnel } from "./UI.tunnel"
import { useGetExactPlanetaryElevation } from "./useGetExactPlanetaryElevation"

export const Altimeter: FC = () => {
  const [tempPosition] = useState(new Vector3())
  const divRef = useRef<HTMLDivElement>(null)
  const getElevation = useGetExactPlanetaryElevation()
  const camera = useThree(state => state.camera)

  useFrame(() => {
    if (!divRef.current) {
      return
    }
    const elevation = getElevation(
      camera.getWorldPosition(tempPosition),
    ).elevation
    divRef.current.innerText = `elevation: ${elevation.toLocaleString()} meters`
  })

  return (
    <UITunnel.In>
      <div ref={divRef}></div>
    </UITunnel.In>
  )
}
