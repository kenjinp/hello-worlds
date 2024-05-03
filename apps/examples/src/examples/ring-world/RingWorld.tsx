import { RingWorld as HelloPlanet } from "@hello-worlds/planets"
import {
  RingWorld as Planet,
  RingWorldChunks,
  useRingWorld,
  useRingWorldChunks,
} from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import { DoubleSide, Vector3 } from "three"

import { Html } from "@react-three/drei"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Worker from "./Doughnut.worker?worker"

const worker = () => new Worker()

const QuadtreeDebugger = () => {
  const [blah, setBlah] = useState()
  const world = useRingWorld()
  const chunks = useRingWorldChunks()

  useLayoutEffect(() => {
    setTimeout(() => {
      setBlah(blah + 1)
    }, 500)
  }, [])

  useEffect(() => {
    // debug chunks
    console.log("chunks:", chunks.length)
  })

  const { quadTree } = world

  return (
    <group>
      <Html>
        <p>{chunks.length}</p>
      </Html>
      {quadTree?.sides.map((side, i) => {
        console.log({ side, size: side.quadtree.root.size })
        return (
          <mesh
            // scale={side.quadtree.root.size}
            scale={1000}
            key={i}
            position={side.quadtree.root.worldCenter}
            matrixWorld={side.quadtree.root.worldMatrix}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="red" side={DoubleSide} />
          </mesh>
        )
      })}
      <RingWorldChunks>
        {chunk => {
          console.log(chunk)
          // Debug Chunk central position
          return (
            <mesh
              scale={1000}
              position={chunk.position}
              matrixWorld={chunk.matrixWorld}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="blue" side={DoubleSide} />
            </mesh>
          )
        }}
      </RingWorldChunks>
    </group>
  )
}

export default () => {
  const camera = useThree(state => state.camera)
  const planet = useRef<HelloPlanet<any>>(null)

  const data = useMemo(() => {
    // const points = fibonacciSphere(100, 10, Math.random)
    // console.log(d3.geoVoronoi(points.map(())
    return {
      voronoi: "blah",
      seed: "plate tectonics example",
    }
  }, [])

  console.log(data)

  return (
    <group
    // Rotate World so it's along the x axis
    >
      <group>
        <Planet
          position={new Vector3()}
          length={15_000}
          ref={planet}
          radius={2_500}
          minCellSize={64}
          minCellResolution={64}
          lodOrigin={camera.position}
          worker={worker}
          data={data}
          inverted
        >
          <meshStandardMaterial vertexColors side={DoubleSide} />
          <directionalLight position={new Vector3()} intensity={2} />
          <axesHelper args={[20_000]} />
        </Planet>

        <directionalLight
          position={new Vector3(100_000, 0, 100_000)}
          intensity={5}
        />
      </group>
      <group rotation={[0, 0, 0]}>
        <Planet
          position={new Vector3()}
          length={2_000}
          ref={planet}
          radius={15_000}
          minCellSize={64}
          minCellResolution={64}
          lodOrigin={camera.position}
          worker={worker}
          data={data}
          inverted={false}
          skirtDepth={100}
        >
          <meshStandardMaterial vertexColors side={DoubleSide} />
          <directionalLight position={new Vector3()} intensity={2} />
        </Planet>
        <directionalLight
          position={new Vector3(100_000, 0, 100_000)}
          intensity={5}
        />
      </group>
    </group>
  )
}
