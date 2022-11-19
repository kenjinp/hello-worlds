import { Planet, usePlanet } from "@hello-worlds/react"
import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { Vector3 } from "three"
import GerstnerWaterMaterial from "./water/GerstnerWater"

import { PlANET_TYPES } from "../../WorldBuilder.state"
import worker from "../../WorldBuilder.worker"

const Water: React.FC = () => {
  const planet = usePlanet()
  const mat = React.useRef<GerstnerWaterMaterial>(new GerstnerWaterMaterial())

  React.useEffect(() => {
    planet.material = mat.current.material
  }, [planet])

  useFrame((_, dt) => {
    mat.current.update(dt)
  })

  return null
}

const Ocean: React.FC<{ seaLevel: number; radius: number }> = ({
  seaLevel,
  radius,
}) => {
  const camera = useThree(s => s.camera)

  const data = React.useMemo(
    () => ({ seaLevel, type: PlANET_TYPES.OCEAN }),
    [seaLevel],
  )

  return (
    <Planet
      radius={radius}
      position={new Vector3()}
      lodOrigin={camera.position}
      minCellSize={32 * 8}
      minCellResolution={32 * 2}
      worker={worker}
      data={data}
    >
      <meshPhongMaterial
        shininess={90}
        reflectivity={1}
        color={0x1c557e}
        vertexColors
      />
    </Planet>
  )
}

export default Ocean
