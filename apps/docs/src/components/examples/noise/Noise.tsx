import { FlatWorld } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import { NOISE_TYPES } from "@site/../../packages/planets/dist/esm"
import * as React from "react"
import { Euler, Vector3 } from "three"
import ExampleWrapper from "../ExampleWrapper"
import worker from "./Noise.worker"

const Example: React.FC<{ noiseType: NOISE_TYPES }> = ({ noiseType }) => {
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
          noiseType,
        }}
      >
        <meshStandardMaterial vertexColors side={2} />
      </FlatWorld>
    </group>
  )
}

export function NoiseExample({ noiseType }) {
  return (
    <ExampleWrapper link="https://github.com/kenjinp/hello-worlds/tree/main/apps/docs/src/components/examples/noise">
      <group position={new Vector3(0, -1, 0).multiplyScalar(1000)}>
        <Example noiseType={noiseType} />
      </group>
    </ExampleWrapper>
  )
}
