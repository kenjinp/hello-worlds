import { ChunkDebugger } from "@components/ChunkDebugger"
import { OrbitCamera, Planet } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Vector3 } from "three"
import ExampleWrapper from "../ExampleWrapper"

const worker = () => new Worker(new URL("./Planet.worker", import.meta.url))

const Example: React.FC = () => {
  const camera = useThree(s => s.camera)
  return (
    <Planet
      position={new Vector3()}
      radius={10_000}
      minCellSize={32 * 8}
      minCellResolution={32}
      lodOrigin={camera.position}
      lodDistanceComparisonValue={3}
      worker={worker}
      data={{
        seed: "Flat Worlds Example",
      }}
    >
      <ChunkDebugger />
      <OrbitCamera />
      <meshStandardMaterial vertexColors side={2} wireframe />
    </Planet>
  )
}

export default function PlanetExample({ style = {} }) {
  return (
    <ExampleWrapper controls={null} style={style}>
      <Example />
    </ExampleWrapper>
  )
}
