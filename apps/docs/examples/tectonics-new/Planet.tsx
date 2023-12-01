import { EARTH_RADIUS } from "@game/Math"
import { OrbitCamera, Planet, usePlanet } from "@hello-worlds/react"
import { Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useControls } from "leva"
import * as React from "react"
import { Color, MathUtils, Vector3 } from "three"
import { Plate, Tectonics } from "./tectonics/Tectonics"

const tempVector3 = new Vector3()

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

const PlateLabels = ({ tectonics }) => {
  return (
    <>
      {Array.from(tectonics.plates.values()).map((plate: Plate, index) => {
        return (
          <Html
            position={plate.origin.toCartesian(
              EARTH_RADIUS + 10_000,
              tempVector3,
            )}
            occlude
            // occlude="blending"
            style={{
              width: "400px",
              height: "200px",
            }}
          >
            <div>
              <h1 style={{ color: "white" }}>Plate {index + 1}</h1>
              <p>{plate.uuid}</p>
            </div>
          </Html>
        )
      })}
    </>
  )
}

export const ExamplePlanet: React.FC = () => {
  const camera = useThree(s => s.camera)
  const {
    size,
    resolution,
    numberOfPlates,
    showMovement,
    showPlanet,
    showPlateBoundaries,
  } = useControls({
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
    showPlateBoundaries: true,
    showMovement: true,
    showPlanet: true,
  })

  const tectonics = React.useMemo(() => {
    console.log("generating tectonics")
    const oceanicRate = 0.75
    const origin = new Vector3()
    return new Tectonics({
      numberOfPlates,
      origin,
      radius: EARTH_RADIUS,
      resolution,
      createPlateData: () => {
        const oceanic = MathUtils.randFloat(0, 1) < oceanicRate

        return {
          color: new Color(Math.random() * 0xffffff),
          driftAxis: new Vector3().randomDirection(),
          driftRate: MathUtils.randFloat(-Math.PI / 30, Math.PI / 30),
          spinRate: MathUtils.randFloat(-Math.PI / 30, Math.PI / 30),
          radius: EARTH_RADIUS,
          origin,
          elevation: oceanic
            ? MathUtils.randFloat(-0.8, -0.3)
            : MathUtils.randFloat(0.1, 0.5),
          oceanic,
        }
      },
    })
  }, [numberOfPlates, resolution])

  const userData = React.useMemo(() => ({
    seed: "Tectonics",
    tectonics,
    vertexUserData: new Map()
  }), [tectonics])

  return (
    <>
      <Planet
        key="planet"
        position={new Vector3()}
        radius={EARTH_RADIUS}
        minCellSize={32 * 8}
        minCellResolution={32}
        lodOrigin={camera.position}
        lodDistanceComparisonValue={3}
        worker={worker}
        data={userData}
        autoUpdate={false}
      >
        {/* <PlateLabels tectonics={tectonics} /> */}
        {/* <PlateEdges tectonics={tectonics} /> */}
        {/* <ChunkDebugger /> */}
        <OrbitCamera />
        <ToggleLodOriginHelper />
        <meshStandardMaterial vertexColors side={2} visible={showPlanet} />
      </Planet>
      {/* {showPlateBoundaries && <PlateBoundaries tectonics={tectonics} />} */}
      {/* {showMovement && <PlateMovement tectonics={tectonics} />} */}
    </>
  )
}
