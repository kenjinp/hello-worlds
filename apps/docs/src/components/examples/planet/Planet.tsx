import { Planet } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Euler, Vector3 } from "three"
import ExampleWrapper from "../ExampleWrapper"
import worker from "./Planet.worker"

const Example: React.FC = () => {
  const camera = useThree(s => s.camera)
  return (
    // Rotate World so it's along the x axis
    <group
      rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
    >
      <Planet
        position={new Vector3()}
        radius={10_000}
        minCellSize={32}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={{
          seed: "Flat Worlds Example",
        }}
      >
        <meshStandardMaterial vertexColors side={2} />
      </Planet>
    </group>
  )
}

export default function PlanetExample() {
  return (
    <ExampleWrapper link="https://github.com/kenjinp/hello-worlds/tree/main/apps/docs/src/components/examples/planet">
      <Example />
    </ExampleWrapper>
  )
}
