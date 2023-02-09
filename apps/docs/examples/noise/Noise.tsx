import { NOISE_TYPES } from "@hello-worlds/planets"
import { FlatWorld } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Euler, Vector3 } from "three"
import ExampleWrapper from "../ExampleWrapper"

const worker = () => new Worker(new URL("./Noise.worker", import.meta.url))

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

export default function NoiseExample({ noiseType }) {
  return (
    <ExampleWrapper>
      <group position={new Vector3(0, -1, 0).multiplyScalar(1000)}>
        <Example noiseType={noiseType} />
      </group>
    </ExampleWrapper>
  )
}
