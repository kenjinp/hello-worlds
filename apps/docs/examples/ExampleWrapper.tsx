import { OrbitControls, Stars } from "@react-three/drei"
import * as React from "react"
import { Color, Vector3 } from "three"
import { Button } from "../button/Button"
import { SpaceBox } from "../SpaceBox"
import { Canvas } from "../world-builder/WorldBuilder.canvas"
import { AU } from "../world-builder/WorldBuilder.math"

export default function ExampleWrapper({
  children,
  controls = <OrbitControls enablePan enableZoom maxDistance={100_000} />,
}): React.ReactElement {
  return (
    <div
      id="example"
      style={{ height: 800, borderRadius: "1em", position: "relative" }}
    >
      <Canvas style={{ borderRadius: "1em" }}>
        <SpaceBox />
        <directionalLight color={new Color("white")} intensity={0.4} />
        <group
          scale={new Vector3(1, 1, 1).multiplyScalar(AU).multiplyScalar(10)}
        >
          <Stars saturation={1} />
        </group>
        {children}
        {controls}
      </Canvas>
      <div style={{ position: "absolute", bottom: "1em", left: "1em" }}>
        <Button
          onClick={() => document.getElementById("example").requestFullscreen()}
        >
          Full Screen
        </Button>{" "}
      </div>
    </div>
  )
}
