import { RingWorld } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Euler, Vector3 } from "three"
import ExampleWrapper from "../ExampleWrapper"
import worker from "./RingWorld.worker"

const Example1: React.FC = () => {
  const camera = useThree(s => s.camera)
  return (
    // Rotate World so it's along the x axis
    <group
      rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
    >
      <RingWorld
        inverted
        position={new Vector3()}
        radius={10_000}
        length={100}
        minCellSize={32}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={{
          seed: "Flat Worlds Example",
        }}
      >
        <meshStandardMaterial vertexColors side={2} />
      </RingWorld>
    </group>
  )
}

const Example2: React.FC = () => {
  const camera = useThree(s => s.camera)
  return (
    // Rotate World so it's along the x axis
    <group
      rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
    >
      <RingWorld
        inverted
        position={new Vector3()}
        radius={5_000}
        length={20_000}
        minCellSize={32}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={{
          seed: "Flat Worlds Example",
        }}
      >
        <meshStandardMaterial vertexColors side={2} />
      </RingWorld>
    </group>
  )
}

export function RingWorldExampleThin() {
  return (
    <ExampleWrapper link="https://github.com/kenjinp/hello-worlds/tree/main/apps/docs/src/components/examples/planet">
      <Example1 />
    </ExampleWrapper>
  )
}

export function RingWorldExampleLong() {
  return (
    <ExampleWrapper link="https://github.com/kenjinp/hello-worlds/tree/main/apps/docs/src/components/examples/planet">
      <Example2 />
    </ExampleWrapper>
  )
}
