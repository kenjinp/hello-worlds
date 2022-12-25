import type { AppProps } from "next/app"
import type { ReactElement } from "react"
import * as React from "react"
import "../styles.css"

import { useThemeUI } from "theme-ui"

function mouseEventToSphericalCoordinates(mouseEvent: MouseEvent): {
  phi: number
  theta: number
} {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  // Calculate the normalized mouse position relative to the center of the viewport
  const x = (mouseEvent.clientX - viewportWidth / 2) / (viewportWidth / 2)
  const y = (mouseEvent.clientY - viewportHeight / 2) / (viewportHeight / 2)

  // Convert the normalized mouse position to spherical coordinates
  const phi = Math.atan2(y, x)
  const theta = Math.sqrt(x ** 2 + y ** 2)

  return { phi, theta }
}

const MouseWiggler: React.FC = () => {
  const context = useThemeUI()

  React.useEffect(() => {
    if (!context) {
      return
    }
    const onMouseMoveListener = (e: MouseEvent) => {
      const hue = (mouseEventToSphericalCoordinates(e).phi * 180) / Math.PI
      document.documentElement.style.setProperty(
        "--nextra-primary-hue",
        hue + "deg",
      )
    }

    window.addEventListener("mousemove", onMouseMoveListener)
    return () => {
      window.removeEventListener("mousemove", onMouseMoveListener)
    }
  }, [context])
  return null
}

export default function Nextra({
  Component,
  pageProps,
}: AppProps): ReactElement {
  console.log({ pageProps })
  return (
    <>
      {/* <ThemeProvider theme={theme}> */}
      <MouseWiggler />
      <Component {...pageProps} />
      {/* </ThemeProvider> */}
    </>
  )
}
