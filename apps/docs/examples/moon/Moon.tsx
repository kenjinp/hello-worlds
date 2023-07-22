import { Controls } from "@game/player/KeyboardController"
import { random, setRandomSeed } from "@hello-worlds/core"
import { LatLong, Noise, getRandomBias } from "@hello-worlds/planets"
import {
  Planet as HelloPlanet,
  OrbitCamera,
  usePlanet,
} from "@hello-worlds/react"
import {
  FlyControls,
  PointerLockControls,
  useKeyboardControls,
} from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import Poisson from "poisson-disk-sampling"
import React, { useMemo } from "react"
import { Color, Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"
import { randFloat } from "three/src/math/MathUtils"
import { usePointerLock } from "../../hooks/usePointerLock"
import { Altimeter } from "./Altimeter"
import { Character } from "./Character"
import { MoonChunk } from "./Moon.chunk"
import { MouseCaster } from "./MouseCaster"
import { useGetExactPlanetaryElevation } from "./useGetExactPlanetaryElevation"
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
  const getElevation = useGetExactPlanetaryElevation()
  useFrame(() => {
    if (!flyControls.current) {
      return
    }
    const { elevation, pointOnPlanet } = getElevation(camera.position)
    const altitude =
      camera.position.distanceTo(planet.position) - planet.radius - elevation

    const movementSpeed = Math.max(Math.abs(altitude), 100)

    if (altitude < 0) {
      camera.position.copy(pointOnPlanet)
    }

    flyControls.current.movementSpeed = movementSpeed
    flyControls.current.rollSpeed = 0.2
  })

  return <FlyControls ref={flyControls} dragToLook />
}

const tempVector3 = new Vector3()
const ReconcileElevationForLOD: React.FC = () => {
  const planet = usePlanet()
  const camera = useThree(store => store.camera)
  const [lodPosition] = React.useState(camera.position.clone())
  const getElevation = useGetExactPlanetaryElevation()

  useFrame(() => {
    // offset position with height of terrain to get true lod resolution
    camera.getWorldPosition(lodPosition)
    const { elevation } = getElevation(lodPosition)
    // Vector3 newSpot = oldSpotVector3 + (directionVector3.normalized * distanceFloat);
    const dirToPlanet = tempVector3
      .copy(planet.position)
      .sub(lodPosition)
      .normalize()

    lodPosition.copy(dirToPlanet.multiplyScalar(elevation).add(lodPosition))
    planet.userData.lodPosition = lodPosition
    planet.update(lodPosition)
  })

  return null
}

export const Moon: React.FC<{ radius: number }> = ({ radius }) => {
  const camera = useThree(store => store.camera)
  const canvas = useThree(store => store.gl.domElement)
  const [isWalking, setIsWalking] = React.useState(false)
  const [subscribeKeys] = useKeyboardControls()
  const [lodPosition] = React.useState(camera.position.clone())
  const { locked, requestPointerLock } = usePointerLock(canvas)

  React.useEffect(() => {
    return subscribeKeys(
      state => state[Controls.special],
      pressed => {
        if (!pressed) {
          return
        }
        if (!isWalking) {
          setIsWalking(true)
          requestPointerLock()
        } else {
          setIsWalking(false)
          document.exitPointerLock()
        }
      },
    )
  }, [isWalking])

  React.useEffect(() => {
    const initialPosition = new Vector3(1, 1, 1).multiplyScalar(radius * 2)
    camera.position.copy(initialPosition)
    camera.lookAt(new Vector3()) // normally you want to set to planet position
    console.log("resetting camera")
  }, [])

  const initialData = useMemo(() => {
    const pNoise = new Noise({
      seed: "Semiarid Terran World 1314234",
      scale: 180 * 2,
      octaves: 2,
      height: 4,
    })

    const pds = new Poisson({
      shape: [90 * 2, 180 * 2],
      minDistance: 1,
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
    const seed = "hello world"
    setRandomSeed(seed)
    return {
      seed,
      craters: getRandomSubarray(centers, 0).map(center => {
        return {
          floorHeight: randFloat(-0.01, 0),
          radius: getRandomBias(1000, 100_000, 1_000, 0.8),
          center,
          rimWidth: randFloat(0.4, 0.8),
          rimSteepness: randFloat(0.2, 1),
          smoothness: randFloat(0.2, 1),
          debugColor: new Color(random() * 0xffffff),
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
        minCellSize={64}
        minCellResolution={32 * 2}
        lodOrigin={lodPosition}
        worker={worker}
        data={initialData}
        autoUpdate={false}
      >
        {isWalking ? (
          // characters.map((c, index) => (
          <>
            <Character
              originalPosition={camera.getWorldPosition(tempVector3).clone()}
              key={camera.position.toArray().toString()}
            />
            <PointerLockControls />
          </>
        ) : (
          // ))
          <>
            <MouseCaster />
            <OrbitCamera />
          </>
        )}
        <ReconcileElevationForLOD />
        <MoonChunk />
        <meshPhysicalMaterial metalness={0} reflectivity={0.01} vertexColors />
        {/* <Ground /> */}
        <Altimeter />
      </HelloPlanet>
    </>
  )
}
