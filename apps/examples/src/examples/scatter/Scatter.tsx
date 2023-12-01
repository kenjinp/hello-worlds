import { FlatWorld as HelloFlatWorld } from "@hello-worlds/planets"
import { FlatWorld } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import { DoubleSide, Euler, Vector3 } from "three"

import { useRef } from "react"
import Worker from "./Scatter.worker?worker"

const worker = () => new Worker()
export default () => {
  const controls = useThree(state => state.controls)
  const camera = useThree(state => state.camera)
  const scene = useThree(state => state.scene)
  const flatWorld = useRef<HelloFlatWorld<any>>(null)

  camera.position.set(-809.4739943418741, 739.46933062522, 651.9329496161308)

  return (
    <group
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
  )
}
