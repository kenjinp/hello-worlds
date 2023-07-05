import { PlanetChunks } from "@hello-worlds/react"
import { Sampler } from "@react-three/drei"
import { randFloat } from "three/src/math/MathUtils"

export const MoonChunkScatter: React.FC = () => {
  return (
    <PlanetChunks>
      {chunk => {
        // defensive programming
        const indices = chunk.geometry.getIndex()
        if (!indices?.count) {
          return null
        }

        return chunk.LODLevel === 0 ? (
          <Sampler
            transform={({ dummy }) => {
              dummy.scale.setScalar(randFloat(1, 10))
              // dummy.position.copy(position)
            }}
          >
            <mesh>
              <bufferGeometry attach="geometry" {...chunk.geometry} />
              <meshBasicMaterial visible={false} />
            </mesh>
            <instancedMesh args={[null, null, 500]}>
              <boxGeometry />
              <meshStandardMaterial />
            </instancedMesh>
          </Sampler>
        ) : null
      }}
    </PlanetChunks>
  )
}
