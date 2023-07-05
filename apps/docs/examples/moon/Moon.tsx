import { Controls } from "@game/player/KeyboardController"
import { LatLong, Noise, getRandomBias } from "@hello-worlds/planets"
import { Planet as HelloPlanet, usePlanet } from "@hello-worlds/react"
import { FlyControls, useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import Poisson from "poisson-disk-sampling"
import React, { useMemo } from "react"
import { Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"
import { randFloat } from "three/src/math/MathUtils"
import { Character } from "./Character"
import { ShootBoxes } from "./Moon.boxes"
const worker = () => new Worker(new URL("./Moon.worker", import.meta.url))

const position = new Vector3()

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

const FlyCamera = () => {
  const planet = usePlanet()
  const flyControls = React.useRef<FlyControlsImpl>()
  const camera = useThree(s => s.camera)

  useFrame(() => {
    if (!flyControls.current) {
      return
    }
    const alt = camera.position.distanceTo(planet.position) - planet.radius

    flyControls.current.movementSpeed = Math.max(Math.abs(alt), 100)
    flyControls.current.rollSpeed = 0.2
  })

  return <FlyControls ref={flyControls} dragToLook />
}

export const Moon: React.FC<{ radius: number }> = ({ radius }) => {
  const camera = useThree(store => store.camera)
  const [isWalking, setIsWalking] = React.useState(false)
  const [subscribeKeys] = useKeyboardControls()

  React.useEffect(() => {
    return subscribeKeys(
      state => state[Controls.use],
      pressed => {
        pressed && setIsWalking(!isWalking)
      },
    )
  }, [isWalking])

  React.useEffect(() => {
    const initialPosition = new Vector3(1, 1, 1).multiplyScalar(radius * 2)
    camera.position.copy(initialPosition)
    camera.lookAt(new Vector3())
  }, [camera])

  const initialData = useMemo(() => {
    const pNoise = new Noise({
      seed: "RimWorld",
      scale: 180 * 2,
      octaves: 2,
      height: 4,
    })

    const pds = new Poisson({
      shape: [90 * 2, 180 * 2],
      minDistance: 1.5,
      maxDistance: 180,
      tries: 20,
      distanceFunction: point => {
        // value between 0 and 1
        const v = pNoise.get(point[0], point[1], 100)
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
      craters: getRandomSubarray(centers, 0).map(center => {
        return {
          floorHeight: randFloat(-0.01, 0),
          radius: getRandomBias(1000, 100_000, 1_000, 0.8),
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
        key="cool-mars"
        position={position}
        radius={radius}
        minCellSize={32 * 8}
        minCellResolution={32}
        lodOrigin={camera.position}
        worker={worker}
        data={initialData}
      >
        {/* <OrbitCamera /> */}
        {/* <ChunkDebugger /> */}
        {isWalking ? (
          <Character originalPosition={camera.position} />
        ) : (
          <FlyCamera />
        )}
        <meshPhysicalMaterial metalness={0} reflectivity={0.01} vertexColors />
        {/* <Ground /> */}
      </HelloPlanet>
      <ShootBoxes />
    </>
  )
}
