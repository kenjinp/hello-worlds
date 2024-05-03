import { Planet as HelloPlanet } from "@hello-worlds/planets"
import { OrbitCamera, Planet } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import { DoubleSide } from "three"

import { useMemo, useRef } from "react"
import Worker from "./Tectonics.worker?worker"
import { VoronoiSphere } from "./math/Voronoi"

const worker = () => new Worker()
export default () => {
  const camera = useThree(state => state.camera)
  const planet = useRef<HelloPlanet<any>>(null)

  const data = useMemo(() => {
    // const points = fibonacciSphere(100, 10, Math.random)
    // console.log(d3.geoVoronoi(points.map(())
    VoronoiSphere.generate()
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
      <Planet
        ref={planet}
        radius={64 * 1000}
        minCellSize={64}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={data}
      >
        <meshStandardMaterial vertexColors side={DoubleSide} />
        <OrbitCamera />
      </Planet>
    </group>
  )
}
