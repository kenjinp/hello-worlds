import { FlatWorld as HelloFlatWorld } from "@hello-worlds/planets"
import {
  FlatWorld,
  FlatWorldChunks,
  useFlatWorldChunks,
} from "@hello-worlds/react"
import { useThree } from "@react-three/fiber"
import {
  DoubleSide,
  Euler,
  MeshBasicMaterial,
  RepeatWrapping,
  Texture,
  Vector3,
} from "three"

import { useTexture } from "@react-three/drei"
import { useEffect, useRef } from "react"
import Worker from "./Heightmap.worker?worker"

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

const worker = () => new Worker()

export const RenderImage = () => {
  const chunks = useFlatWorldChunks()

  useEffect(() => {
    const displayer = document.createElement("div")
    displayer.id = "displayer"
    displayer.style.position = "fixed"
    displayer.style.top = "0"
    displayer.style.left = "0"
    displayer.style.width = "100vw"
    displayer.style.height = "100vh"
    displayer.style.display = "flex"
    displayer.style.flexWrap = "wrap"
    displayer.style.gap = "8px"
    displayer.style.padding = "50px 8px 8px 8px"
    displayer.style.rowGap = "8px"
    displayer.style.zIndex = "999999"
    displayer.style.pointerEvents = "none"

    const imgs = chunks.map(async chunk => {
      const floatBufferThingy = chunk.heightmap
      if (!floatBufferThingy) return null
      const u8IntClamped = new Uint8ClampedArray(floatBufferThingy!)
      const l = Math.sqrt(u8IntClamped.length / 4)
      const data = new ImageData(u8IntClamped, l, l)
      const img = await imageDataToImage(data)
      img.width = l
      img.height = l
      return img
    }) as Promise<HTMLImageElement>[]
    Promise.all(imgs).then(imgs => {
      imgs.forEach(img => {
        displayer.appendChild(img)
      })
    })
    document.body.appendChild(displayer)

    return () => {
      document.body.removeChild(displayer)
    }
  }, [chunks])

  return null
}

export default () => {
  const controls = useThree(state => state.controls)
  const camera = useThree(state => state.camera)
  const scene = useThree(state => state.scene)
  const flatWorld = useRef<HelloFlatWorld<any>>(null)
  const [uv, grass] = useTexture(["./uv.png", "./grass.png"])
  grass.repeat.set(100, 100)
  grass.wrapS = RepeatWrapping
  grass.wrapT = RepeatWrapping
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
        <RenderImage />
        <FlatWorldChunks>
          {chunk => {
            if (!chunk) return null
            const floatBufferThingy = chunk.heightmap
            if (!floatBufferThingy) return null
            const u8IntClamped = new Uint8ClampedArray(floatBufferThingy!)
            const l = Math.sqrt(u8IntClamped.length / 4)
            const data = new ImageData(u8IntClamped, l, l)
            imageDataToImage(data).then(img => {
              img.width = l
              img.height = l
              const texture = new Texture()
              // required
              texture.image = img
              texture.needsUpdate = true
              chunk.material = new MeshBasicMaterial({
                map: texture,
                side: DoubleSide,
              })
            })
            return null
          }}
        </FlatWorldChunks>
        <meshStandardMaterial side={DoubleSide} />
      </FlatWorld>
    </group>
  )
}
