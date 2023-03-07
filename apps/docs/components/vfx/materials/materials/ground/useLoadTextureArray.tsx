import { useTexture } from "@react-three/drei"
import * as React from "react"
import {
  DataArrayTexture,
  NearestFilter,
  NearestMipMapNearestFilter,
  RepeatWrapping,
} from "three"

export interface UseLoadTextureArrayOptions {
  dimensions: number
}

// Taken from https://github.com/mrdoob/three.js/issues/758
function getImageData(image: HTMLImageElement) {
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext("2d")
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

export const useLoadTextureArray = (
  imageList: string[],
  { dimensions }: UseLoadTextureArrayOptions,
) => {
  const imgs = useTexture(imageList)
  const [texture, setTexture] = React.useState<DataArrayTexture>(null)

  React.useEffect(() => {
    const atlas = imgs
    const data = new Uint8Array(imgs.length * 4 * dimensions * dimensions)

    for (let t = 0; t < atlas.length; t++) {
      const curTexture = atlas[t]
      const curData = getImageData(curTexture.image)
      const offset = t * (4 * dimensions * dimensions)
      data.set(curData.data, offset)
    }

    const texture = new DataArrayTexture(
      data,
      dimensions,
      dimensions,
      atlas.length,
    )

    // Don't do this here
    texture.minFilter = NearestMipMapNearestFilter
    texture.magFilter = NearestFilter
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.generateMipmaps = true
    texture.needsUpdate = true

    setTexture(texture)
  }, [imgs])

  return texture
}
