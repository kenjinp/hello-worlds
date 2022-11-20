import { FlatWorld } from "@hello-worlds/react"
import { OrbitControls, Stars } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Color, Euler, Vector3 } from "three"
import { SpaceBox } from "../../SpaceBox"
import { Canvas } from "../../world-builder/WorldBuilder.canvas"
import { AU } from "../../world-builder/WorldBuilder.math"
import worker from "./FlatWorld.worker"

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
    <div style={{ height: 800, borderRadius: "1em" }}>
      <Canvas style={{ borderRadius: "1em" }}>
        <SpaceBox />
        <directionalLight color={new Color("white")} intensity={0.4} />
        <group
          scale={new Vector3(1, 1, 1).multiplyScalar(AU).multiplyScalar(10)}
        >
          <Stars saturation={1} />
        </group>
        <Example />
        <OrbitControls
          enablePan
          enableZoom
          maxDistance={100_000}
          minDistance={500}
        />
      </Canvas>
    </div>
  )
}
