import { useControls } from "leva"
import { Vector3 } from "three"
import { Grass } from "./Grass"

export default () => {
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
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
      <mesh position={new Vector3(0, 0, 10)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial />
        <Grass {...grassProps} />
      </mesh>
    </mesh>
  )
}
