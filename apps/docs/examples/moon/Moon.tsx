import { ChunkDebugger } from "@components/ChunkDebugger"
import { MOON_RADIUS } from "@game/Math"
import { LatLong, Noise, getRandomBias } from "@hello-worlds/planets"
import { Planet as HelloPlanet, usePlanet } from "@hello-worlds/react"
import { FlyControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import Poisson from "poisson-disk-sampling"
import React, { useMemo } from "react"
import { Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"
import { randFloat } from "three/src/math/MathUtils"
const worker = () => new Worker(new URL("./Moon.worker", import.meta.url))

const position = new Vector3()
const tempVector3 = new Vector3()

function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index
  while (i--) {
    index = Math.floor((i + 1) * Math.random())
    temp = shuffled[index]
    shuffled[index] = shuffled[i]
    shuffled[i] = temp
  }
  return shuffled.slice(0, size)
}

const _tempVector3 = new Vector3()
const FlyCamera = () => {
  const planet = usePlanet()
  const flyControls = React.useRef<FlyControlsImpl>()
  const camera = useThree(s => s.camera)

  React.useEffect(() => {
    camera.position.copy(new Vector3(1, 1, 1).multiplyScalar(planet.radius * 2))
    camera.lookAt(planet.position)
  }, [camera])

  useFrame(() => {
    if (!flyControls.current) {
      return
    }
    const alt = camera.position.distanceTo(planet.position) - MOON_RADIUS

    flyControls.current.movementSpeed = Math.abs(alt)
    flyControls.current.rollSpeed = 0.2
  })

  return <FlyControls ref={flyControls} />
}

export const Moon: React.FC = () => {
  const radius = MOON_RADIUS
  const camera = useThree(store => store.camera)
  const initialData = useMemo(() => {
    const pNoise = new Noise({
      seed: "RimWorld",
      scale: 90,
      octaves: 2,
      height: 2,
    })
    let min = 0
    let max = 0

    const pds = new Poisson({
      shape: [90 * 2, 180 * 2],
      minDistance: 1,
      maxDistance: 180,
      tries: 20,
      distanceFunction: point => {
        // value between 0 and 1
        const v = pNoise.get(point[0], point[1], 100)
        min = Math.min(min, v)
        max = Math.max(max, v)
        return v
      },
    })

    // var points = pds.fill();
    const latLong = new LatLong()
    pds.fill()
    const points = pds.getAllPoints()
    const centers = []

    for (let i = 0; i < points.length; i++) {
      const [lat, long] = points[i]
      latLong.set(lat - 90, long - 180)
      centers.push(latLong.toCartesian(radius, new Vector3()))
    }

    return {
      seed: "hello world",
      craters: getRandomSubarray(centers, 1200).map(center => {
        return {
          floorHeight: randFloat(-0.1, 0),
          radius: getRandomBias(1000, 100_000, 3_000, 0.8),
          center,
          rimWidth: randFloat(0.4, 0.8),
          rimSteepness: randFloat(0.2, 1),
          smoothness: randFloat(0.2, 1),
        }
      }),
    }
  }, [])

  console.log(initialData)

  return (
    <>
      <HelloPlanet
        position={position}
        radius={radius}
        minCellSize={32 * 8}
        minCellResolution={32 * 6}
        lodOrigin={camera.position}
        worker={worker}
        data={initialData}
      >
        {/* <OrbitCamera /> */}
        <FlyCamera />
        <ChunkDebugger />
        <meshPhysicalMaterial vertexColors metalness={0} reflectivity={0.01} />
      </HelloPlanet>
    </>
  )
}
