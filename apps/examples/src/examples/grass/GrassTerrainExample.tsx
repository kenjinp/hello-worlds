import { FlatWorld as HelloFlatWorld } from "@hello-worlds/planets"
import { FlatWorld, useFlatWorldChunks } from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import { Euler, RepeatWrapping, Texture, Vector3 } from "three"

import { useTexture } from "@react-three/drei"
import { useControls } from "leva"
import { useEffect, useRef, useState } from "react"
import { RenderImage } from "../heightmap/Heightmap"
import { Grass, GrassProps } from "./Grass"
import Worker from "./Grass.worker?worker"

async function imageDataToImage(imagedata: ImageData) {
  var canvas = document.createElement("canvas")
  var ctx = canvas.getContext("2d")!
  canvas.width = imagedata.width
  canvas.height = imagedata.height
  const center_w = canvas.width / 2
  const center_h = canvas.height / 2
  const heightmap = await createImageBitmap(imagedata)
  ctx.translate(center_w, center_h)
  ctx.rotate((90 * Math.PI) / 180)
  ctx.translate(-center_w, -center_h)
  ctx.drawImage(heightmap, 0, 0)
  var image = new Image()
  image.src = canvas.toDataURL()
  return image
}

const GrassWithOffset: React.FC<Omit<GrassProps, "chunk">> = grassProps => {
  const chunks = useFlatWorldChunks()
  const chunkIdList = JSON.stringify(chunks.map(chunk => chunk.id))
  const [chunkTextureMap, setChunkTextureMap] = useState<{
    [key: string]: Texture
  }>({})
  const lodTable = [6, 4, 2, 1]
  const lodNumGrass = [64, 32, 32, 16]
  const lodJitterTable = [1, 2, 3, 4]

  useEffect(() => {
    // build heightmap offset textures
    chunks.forEach(async chunk => {
      if (!chunk.heightmap) return
      const u8IntClamped = new Uint8ClampedArray(chunk.heightmap)
      const l = Math.sqrt(u8IntClamped.length / 4)
      const heightmapImageData = new ImageData(u8IntClamped, l, l)
      const heightmap = await imageDataToImage(heightmapImageData)
      const texture = new Texture()
      texture.image = heightmap
      texture.needsUpdate = true
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(1, 1)
      setChunkTextureMap(prev => ({ ...prev, [chunk.id]: texture }))
    })
  }, [chunkIdList])

  return chunks.map(chunk => {
    const lodNumGrassSteps = lodTable[chunk.LODLevel] || 1
    const chunkGrassBladeAmount = Math.floor(
      (chunk.width / (chunk.radius * 2)) * 2048 * 4,
    )
    console.log("henlo I rerender")
    const initialPosition = new Vector3().copy(chunk.offset)
    return (
      <mesh
        key={chunk.id}
        position={initialPosition}
        rotation={new Euler().setFromVector3(new Vector3(Math.PI / 2, 0, 0))}
      >
        <Grass
          key={chunk.id}
          {...grassProps}
          numGrassSteps={lodNumGrassSteps}
          grassPatchSideLength={chunk.width}
          totalGrassBlades={chunkGrassBladeAmount}
          heightmap={chunkTextureMap[chunk.id]}
          minHeight={chunk.minHeight}
          maxHeight={chunk.maxHeight}
        />
        {/* <mesh position={new Vector3().setZ(chunk.minHeight)}>
          <boxGeometry args={[chunk.width, chunk.width, chunk.width]} />
          <meshBasicMaterial
            vertexColors
            wireframe
            color={Math.random() * 0xffffff}
          />
        </mesh> */}
      </mesh>
    )
  })
}

const worker = () => new Worker()
export default () => {
  const camera = useThree(state => state.camera)
  const flatWorld = useRef<HelloFlatWorld<any>>(null)
  const grassProps = useControls({
    terrainVisible: true,
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
      value: 1,
      min: 0,
      max: 10,
    },
    grassHeight: {
      value: 1.5,
      min: 0.01,
      max: 20,
    },
    grassWidth: {
      value: 0.1,
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

  const [grass, uv] = useTexture(["./grass.png", "./uv.png"])
  grass.repeat.set(10, 10)
  grass.wrapS = RepeatWrapping
  grass.wrapT = RepeatWrapping

  camera.position.set(-809.4739943418741, 739.46933062522, 651.9329496161308)

  return (
    <>
      <group
        // Rotate World so it's along the x axis
        rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
      >
        <FlatWorld
          ref={flatWorld}
          size={512}
          minCellSize={64}
          minCellResolution={32}
          lodOrigin={camera.position}
          worker={worker}
          data={{
            seed: "Grass Terrain Example",
          }}
        >
          <GrassWithOffset {...grassProps} />
          <RenderImage />
          <meshStandardMaterial transparent opacity={0.5} color="green" />
        </FlatWorld>
      </group>
    </>
  )
}
