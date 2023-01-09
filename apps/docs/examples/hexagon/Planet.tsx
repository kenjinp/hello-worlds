import { ChunkDebugger } from "@components/ChunkDebugger"
import { EARTH_RADIUS } from "@game/Math"
import { OrbitCamera, Planet, usePlanet } from "@hello-worlds/react"
import { useFrame, useThree } from "@react-three/fiber"
import { useControls } from "leva"
import * as React from "react"
import { Vector3 } from "three"

const worker = () => new Worker(new URL("./Planet.worker", import.meta.url))

const ToggleLodOriginHelper: React.FC = () => {
  const lodPosition = React.useRef(new Vector3())
  const [coupleCamera, setCoupleCamera] = React.useState(true)
  const camera = useThree(s => s.camera)
  const planet = usePlanet()

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "c") {
        setCoupleCamera(!coupleCamera)
      }
    }
    window.addEventListener("keydown", listener)
    return () => {
      window.removeEventListener("keydown", listener)
    }
  }, [coupleCamera])

  useFrame(() => {
    if (coupleCamera) {
      lodPosition.current.copy(camera.position)
    }
    planet.update(lodPosition.current)
  })

  return null
}

export const Example: React.FC = () => {
  const camera = useThree(s => s.camera)
  const { size } = useControls({
    size: {
      min: 0,
      max: 20,
      value: 3,
    },
  })

  return (
    <Planet
      key="planet"
      position={new Vector3()}
      radius={EARTH_RADIUS}
      minCellSize={32 * 4}
      minCellResolution={64}
      lodOrigin={camera.position}
      lodDistanceComparisonValue={3}
      worker={worker}
      data={{
        seed: "Hexagon",
        size,
      }}
      autoUpdate={false}
    >
      <ChunkDebugger />
      <OrbitCamera />
      <ToggleLodOriginHelper />
      <meshStandardMaterial vertexColors side={2} />
    </Planet>
  )
}
