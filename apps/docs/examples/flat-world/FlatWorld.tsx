import { FlatWorld } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Euler, Vector3 } from "three"
import ExampleWrapper from "../ExampleWrapper"
// import worker from "./FlatWorld.worker"

const worker = () => new Worker(new URL("./FlatWorld.worker", import.meta.url))

console.log(worker)

const Example: React.FC = () => {
  const camera = useThree(s => s.camera)
  return (
    // Rotate World so it's along the x axis
    <group
      rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
    >
      <FlatWorld
        position={new Vector3()}
        size={10_000}
        minCellSize={32}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={{
          seed: "Flat Worlds Example",
        }}
      >
        <meshStandardMaterial vertexColors side={2} />
      </FlatWorld>
    </group>
  )
}

export default function FlatWorldExample() {
  return (
    <ExampleWrapper>
      <group position={new Vector3(0, -1, 0).multiplyScalar(1000)}>
        <Example />
      </group>
    </ExampleWrapper>
  )
}
