import { ChunkDebugger } from "@components/ChunkDebugger"
import { EARTH_RADIUS } from "@game/Math"
import { OrbitCamera, Planet, usePlanet } from "@hello-worlds/react"
import { useFrame, useThree } from "@react-three/fiber"
import { useControls } from "leva"
import * as React from "react"
import { Color, MathUtils, Vector3 } from "three"
import { Tectonics } from "./tectonics/Tectonics"

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

export const ExamplePlanet: React.FC = () => {
  const camera = useThree(s => s.camera)
  const { size, resolution, numberOfPlates } = useControls({
    size: {
      min: 0,
      max: 20,
      value: 3,
    },
    resolution: {
      min: 0,
      max: 20,
      value: 3,
    },
    numberOfPlates: 21,
  })

  const tectonics = React.useMemo(() => {
    const oceanicRate = 0.75
    return new Tectonics({
      numberOfPlates,
      origin: new Vector3(),
      radius: EARTH_RADIUS,
      resolution,
      createPlateData: () => {
        const oceanic = MathUtils.randFloat(0, 1) < oceanicRate

        return {
          color: new Color(Math.random() * 0xffffff),
          driftAxis: new Vector3().randomDirection(),
          driftRate: MathUtils.randFloat(-Math.PI / 30, Math.PI / 30),
          spinRate: MathUtils.randFloat(-Math.PI / 30, Math.PI / 30),
          elevation: oceanic
            ? MathUtils.randFloat(-0.8, -0.3)
            : MathUtils.randFloat(0.1, 0.5),
          oceanic,
        }
      },
    })
  }, [numberOfPlates, resolution])

  console.log({ tectonics })

  return (
    <Planet
      key="planet"
      position={new Vector3()}
      radius={EARTH_RADIUS}
      minCellSize={32 * 8}
      minCellResolution={32}
      lodOrigin={camera.position}
      lodDistanceComparisonValue={3}
      worker={worker}
      data={{
        seed: "Tectonics",
        tectonics,
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
