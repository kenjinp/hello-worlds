import { Planet, usePlanet } from "@hello-worlds/react"
import { Stars } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"
import * as React from "react"
import { BackSide, FrontSide, Group, MathUtils, Vector3 } from "three"
import { AtmosphereEffect } from "../atmosphere/Atmosphere"
import BasicScene from "../BasicScene"
import FlyCamera from "../cameras/FlyCamera"
import { EARTH_RADIUS } from "../planet/PlanetConfigurator"

// @ts-ignore this is dumb... its a webworker
import planetWorker, { ThreadParams } from "./p.worker"

function randomSpherePoint(x0, y0, z0, radius) {
  var u = Math.random()
  var v = Math.random()
  var theta = 2 * Math.PI * u
  var phi = Math.acos(2 * v - 1)
  var x = x0 + radius * Math.sin(phi) * Math.cos(theta)
  var y = y0 + radius * Math.sin(phi) * Math.sin(theta)
  var z = z0 + radius * Math.cos(phi)
  return [x, y, z]
}

function getRndBias(min, max, bias, influence) {
  var rnd = Math.random() * (max - min) + min, // random in range
    mix = Math.random() * influence // random mixer
  return rnd * (1 - mix) + bias * mix // mix full range and bias
}

function bias(x: number, bias: number) {
  const k = Math.pow(1 - bias, 3)
  return (x * k) / (x * k - x + 1)
}

export const Atmosphere: React.FC = () => {
  const planet = usePlanet()
  const atmosphere = useControls("atmosphere", {
    atmosphereRadius: {
      min: 1,
      max: planet.planetProps.radius * 5,
      value: planet.planetProps.radius * 1.05,
      step: 1,
    },
  })

  // TODO fix update position and radius
  return (
    <AtmosphereEffect
      planetOrigin={planet.rootGroup.position}
      planetRadius={planet.planetProps.radius}
      sunPosition={new Vector3(-1, 0.75, 1).multiplyScalar(10_000)}
      atmosphereRadius={atmosphere.atmosphereRadius}
    />
  )
}

const tempVector3 = new Vector3()

const radiusMoon = 4_000

function Editor() {
  const planet = useControls("planet", {
    invert: false,
    planetRadius: {
      min: 10,
      max: EARTH_RADIUS * 2,
      value: EARTH_RADIUS / 4,
      step: 10,
    },
    minCellSize: {
      min: 0,
      max: 10_000_000,
      value: 100,
      step: 10,
    },
    minCellResolution: {
      min: 0,
      max: 10_000_000,
      value: 64,
      step: 10,
    },
  })

  const material = useControls("material", {
    basicMaterial: false,
    isBackSide: false,
  })

  const crater = useControls("craters", {
    numberOfCraters: {
      min: 0,
      max: 5000,
      value: 0,
      step: 1,
    },
    minRadius: {
      min: 1,
      max: planet.planetRadius / 2,
      value: 10,
      step: 1,
    },
    maxRadius: {
      min: 1,
      max: planet.planetRadius / 2,
      value: 200,
      step: 1,
    },
    rimWidth: {
      min: 0,
      max: 2,
      value: 0.7,
      step: 0.001,
    },
    rimSteepness: {
      min: 0,
      max: 2,
      value: 0.8,
      step: 0.001,
      // step: 1,
    },
    smoothness: {
      min: 0,
      max: 10,
      value: 0.3,
      step: 0.001,
      // step: 1,
    },
  })
  const groupRef = React.useRef<Group>(null)

  const { camera } = useThree()
  const initialData: {
    randomPoints: ThreadParams["randomPoints"]
  } = React.useMemo(
    () => ({
      randomPoints: Array(crater.numberOfCraters)
        .fill(0)
        .map(() => {
          const [x, y, z] = randomSpherePoint(0, 0, 0, planet.planetRadius)
          const randomRadius = getRndBias(10, planet.planetRadius / 10, 15, 0.9)
          return {
            floorHeight: MathUtils.randFloat(-0.2, 0),
            radius: randomRadius,
            center: tempVector3.set(x, y, z).clone(),
          }
        }),
    }),
    [planet.planetRadius, crater],
  )

  const planetProps = React.useMemo(
    () => ({
      radius: planet.planetRadius,
      minCellSize: planet.minCellSize,
      minCellResolution: planet.minCellResolution,
      invert: planet.invert,
    }),
    [planet],
  )

  return (
    <Planet
      planetProps={planetProps}
      lodOrigin={camera.position}
      worker={planetWorker}
      initialData={initialData}
      data={crater}
    >
      {/* <OrbitCamera /> */}
      {/* <GodCamera /> */}
      <FlyCamera />
      <group
        scale={new Vector3(1, 1, 1)
          .multiplyScalar(planet.planetRadius)
          .multiplyScalar(100)}
      >
        <Stars />
      </group>
      {material.basicMaterial ? (
        <meshBasicMaterial
          vertexColors
          side={material.isBackSide ? BackSide : FrontSide}
        />
      ) : (
        <meshStandardMaterial
          vertexColors
          side={material.isBackSide ? BackSide : FrontSide}
        />
      )}
      {/* <EffectComposer>
        <Atmosphere />
      </EffectComposer> */}
    </Planet>
  )
}

export default function () {
  React.useEffect(() => {}, [])
  return (
    <div>
      <BasicScene>
        <Editor />
      </BasicScene>
      <footer
        style={{
          color: "white",
          display: "flex",
          padding: "1em",
          bottom: "0",
          position: "fixed",
          zIndex: 9,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <h1 id="alt"></h1>
        <h1 id="speed"></h1>
      </footer>
    </div>
  )
}
