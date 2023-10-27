import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { Vector3 } from "three"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { usePlanet } from "../planet/Planet"

export interface OrbitCameraProps {
  maxAltitudeOffset?: number
  maxDistanceMultiplier?: number
  defaultCameraPosition?: Vector3
}

// TODO put into some easing library / utils
const quadtratic = (t: number) => t * (-(t * t) * t + 4 * t * t - 6 * t + 4)
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(4, -10 * x)
}

export const OrbitCamera: React.FC<
  React.PropsWithChildren<OrbitCameraProps>
> = ({
  maxAltitudeOffset = 100,
  maxDistanceMultiplier = 10,
  defaultCameraPosition,
  children,
}) => {
  const planet = usePlanet()
  const orbitControls = React.useRef<OrbitControlsImpl>(null)
  const altitude = React.useRef(0)

  const { camera } = useThree()

  React.useEffect(() => {
    camera.position.copy(
      defaultCameraPosition ||
        new Vector3(planet.radius * 1.5, 0, planet.radius * 1.5),
    )
  }, [planet.radius])

  useFrame(() => {
    if (!orbitControls.current) {
      return
    }
    altitude.current =
      camera.position.distanceTo(planet.position) - planet.radius || 0
    orbitControls.current.zoomSpeed = easeOutExpo(
      altitude.current / orbitControls.current.maxDistance,
    )

    orbitControls.current.rotateSpeed = quadtratic(
      altitude.current / orbitControls.current.maxDistance,
    )
  })

  return (
    <OrbitControls
      // @ts-ignore
      ref={orbitControls}
      enablePan={false}
      enableZoom
      maxDistance={planet.radius * maxDistanceMultiplier}
      minDistance={planet.radius + maxAltitudeOffset}
    >
      {children}
    </OrbitControls>
  )
}
