import type { AppProps } from "next/app"
import type { ReactElement } from "react"
import * as React from "react"
import "../styles.css"

import { ThemeProvider, useThemeUI } from "theme-ui"
import theme from "../theme"

const MouseWiggler: React.FC = () => {
  const context = useThemeUI()

  React.useEffect(() => {
    if (!context) {
      return
    }
    const onMouseMoveListener = (e: MouseEvent) => {
      const max = Math.max(e.clientX, e.clientY)

      const hue = max / 20 + 60
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
  return (
    <ThemeProvider theme={theme}>
      <MouseWiggler />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
