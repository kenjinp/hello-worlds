import { OrbitCamera, Planet } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Vector3 } from "three"
import ExampleWrapper from "../ExampleWrapper"
import worker from "./Planet.worker"

const Example: React.FC = () => {
  const camera = useThree(s => s.camera)
  return (
    <Planet
      position={new Vector3()}
      radius={10_000}
      minCellSize={32}
      minCellResolution={32 * 2}
      lodOrigin={camera.position}
      lodDistanceComparisonValue={3}
      worker={worker}
      data={{
        seed: "Flat Worlds Example",
      }}
    >
      <OrbitCamera />
      <meshStandardMaterial vertexColors side={2} />
    </Planet>
  )
}

export default function PlanetExample() {
  return (
    <ExampleWrapper
      link="https://github.com/kenjinp/hello-worlds/tree/main/apps/docs/src/components/examples/planet"
      controls={null}
    >
      <Example />
    </ExampleWrapper>
  )
}
