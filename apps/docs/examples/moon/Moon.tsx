import { ChunkDebugger } from "@components/ChunkDebugger"
import { CorrectedChunkTranslation } from "@game/render/Planets"
import { LatLong, Noise, getRandomBias } from "@hello-worlds/planets"
import {
  Planet as HelloPlanet,
  PlanetChunks,
  usePlanet,
} from "@hello-worlds/react"
import { FlyControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { Attractor } from "@react-three/rapier-addons"
import Poisson from "poisson-disk-sampling"
import React, { useMemo } from "react"
import { Color, Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"
import { randFloat } from "three/src/math/MathUtils"
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

  React.useEffect(() => {
    camera.position.copy(new Vector3(1, 1, 1).multiplyScalar(planet.radius * 2))
    camera.lookAt(planet.position)
  }, [camera])

  useFrame(() => {
    if (!flyControls.current) {
      return
    }
    const alt = camera.position.distanceTo(planet.position) - planet.radius

    flyControls.current.movementSpeed = Math.max(Math.abs(alt), 100)
    flyControls.current.rollSpeed = 0.2
  })

  return <FlyControls ref={flyControls} />
}

const getLODTable = (radius: number, minCellSize: number) => {
  let LODRatio = 0
  let chunkWidth = radius
  const LODValuesIndex: Record<number, number> = {}
  while (LODRatio < 1) {
    LODRatio = minCellSize / chunkWidth
    LODValuesIndex[chunkWidth] = LODRatio
    chunkWidth /= 2
  }
  return LODValuesIndex
}

export const ShootBoxes: React.FC = () => {
  const [boxes, setBoxes] = React.useState<
    {
      position: Vector3
      size: number
      mass: number
      color: Color
    }[]
  >([])
  const camera = useThree(s => s.camera)
  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "t") {
        setBoxes([
          ...boxes,
          {
            position: camera.position,
            size: randFloat(2, 20),
            mass: randFloat(2, 20),
            color: new Color(Math.random() * 0xffffff),
          },
        ])
      }
    }
    document.addEventListener("keydown", listener)
    return () => {
      document.removeEventListener("keydown", listener)
    }
  }, [boxes])

  return (
    <>
      {boxes.map(({ position, size, mass, color }) => {
        return (
          <RigidBody colliders="cuboid" position={position} mass={mass}>
            <mesh>
              <boxGeometry args={[size, size, size]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </RigidBody>
        )
      })}
    </>
  )
}

const MoonChunkDebugger: React.FC = () => {
  const planet = usePlanet()

  React.useEffect(() => {
    console.log({ radius: planet.radius })
    const LODTable = getLODTable(planet.radius, planet.minCellSize)
    console.log(Object.keys(LODTable).length)
    console.table(LODTable)
  }, [planet])

  return (
    <PlanetChunks>
      {chunk => {
        // defensive programming
        const indices = chunk.geometry.getIndex()
        if (!indices?.count) {
          return null
        }

        return (
          chunk.LODLevel <= 20 && (
            <CorrectedChunkTranslation key={chunk.uuid} chunk={chunk}>
              <RigidBody type="fixed" includeInvisible colliders="trimesh">
                <mesh>
                  <bufferGeometry attach="geometry" {...chunk.geometry} />
                  <meshBasicMaterial wireframe color="red" visible={false} />
                </mesh>
              </RigidBody>
            </CorrectedChunkTranslation>
          )
        )
      }}
    </PlanetChunks>
  )
}

export const Moon: React.FC<{ radius: number }> = ({ radius }) => {
  const camera = useThree(store => store.camera)
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
      craters: getRandomSubarray(centers, 500).map(center => {
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
        position={position}
        radius={radius}
        minCellSize={32 * 8}
        minCellResolution={32}
        lodOrigin={camera.position}
        worker={worker}
        data={initialData}
      >
        {/* <OrbitCamera /> */}
        <FlyCamera />
        <ChunkDebugger />
        <MoonChunkDebugger />
        <meshPhysicalMaterial vertexColors metalness={0} reflectivity={0.01} />
      </HelloPlanet>
      <ShootBoxes />
      <Attractor
        range={radius * 10}
        strength={6.39e23}
        type="newtonian"
        position={position}
      />
    </>
  )
}
