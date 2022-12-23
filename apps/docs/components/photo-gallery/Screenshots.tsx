import fs from "fs"
import { useSSG } from "nextra/ssg"
import path from "path"
import * as React from "react"
import PhotoGallery from "./PhotoGallery"

export async function getStaticProps({ params }) {
  const screenshotPath = path.resolve(
    __dirname,
    "../../../public/img/screenshots",
  )
  const images = fs
    .readdirSync(screenshotPath)
    .filter(file => file.endsWith(".png"))
    .map(file => {
      return "/img/screenshots/" + file
    })

  return {
    props: {
      ssg: {
        screenshots: images,
      },
    },
  }
}

const getImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

const getDimensions = async (src: string) => {
  const img = await getImage(src)
  return {
    width: img.width,
    height: img.height,
  }
}

const loadImages = async (images: string[]) => {
  const promises = images.map(async src => {
    const dimensions = await getDimensions(src)
    return {
      src,
      ...dimensions,
    }
  })
  return Promise.all(promises)
}

export default function Screenshots(props) {
  const numPhotos = props.numPhotos
  // Render posts...
  const ssg = useSSG()
  const [photos, setPhotos] = React.useState([])

  React.useEffect(() => {
    if (!ssg.screenshots) return
    loadImages(ssg.screenshots).then(setPhotos).catch(console.error)
  }, [ssg.screenshots])

  return (
    <>
      {photos && (
        <PhotoGallery photos={photos.slice(0, numPhotos || photos.length)} />
      )}
    </>
  )
}
