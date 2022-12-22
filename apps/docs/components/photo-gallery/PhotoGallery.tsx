import * as React from "react"
import styled from "styled-components"

import PhotoAlbum, { Photo } from "react-photo-album"
import Lightbox, { SlideImage } from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

const Screenshots = styled.div`
  & .react-photo-album--photo {
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
`

const PhotoGallery: React.FC<{ photos: (Photo & SlideImage)[] }> = ({
  photos,
}) => {
  const [index, setIndex] = React.useState(-1)

  return (
    <Screenshots>
      <p>{photos.length} screenshots</p>
      <br />
      <PhotoAlbum
        layout="rows"
        photos={photos}
        targetRowHeight={150}
        onClick={({ index }) => setIndex(index)}
      />

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={photos}
      />
    </Screenshots>
  )
}

export default PhotoGallery
