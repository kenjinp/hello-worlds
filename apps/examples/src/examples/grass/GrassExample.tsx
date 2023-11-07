import { FlatWorld as HelloFlatWorld } from "@hello-worlds/planets"
import { FlatWorld } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import { DoubleSide, Euler, Vector3 } from "three"

import { useControls } from "leva"
import { useRef } from "react"
import { Grass } from "./Grass"
import Worker from "./Grass.worker?worker"

const worker = () => new Worker()
export default () => {
  const controls = useThree(state => state.controls)
  const camera = useThree(state => state.camera)
  const scene = useThree(state => state.scene)
  const flatWorld = useRef<HelloFlatWorld<any>>(null)
  const grassProps = useControls({
    totalGrassBlades: {
      value: 1024,
      min: 1,
      max: 1024 * 10,
    },
    grassPatchSideLength: {
      value: 16,
      min: 1,
      max: 1024,
    },
    grassGridJitter: {
      value: 0.2,
      min: 0,
      max: 10,
    },
    grassHeight: {
      value: 1.5,
      min: 0.01,
      max: 20,
    },
    grassWidth: {
      value: 0.05,
      min: 0.01,
      max: 5,
    },
    grassTipProportion: {
      value: 0.25,
      min: 0.01,
      max: 1,
    },
    numGrassSteps: {
      value: 4,
      min: 1,
      max: 20,
    },
  })

  return (
    <>
      <Grass {...grassProps} />
      <group
        visible={false}
        // Rotate World so it's along the x axis
        rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
      >
        <FlatWorld
          ref={flatWorld}
          size={1_000}
          minCellSize={32}
          minCellResolution={32 * 2}
          lodOrigin={camera.position}
          worker={worker}
          data={{
            seed: "Basic Example",
          }}
        >
          <meshStandardMaterial vertexColors side={DoubleSide} />
        </FlatWorld>
      </group>
    </>
  )
}
