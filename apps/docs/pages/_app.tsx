import type { AppProps } from "next/app"
import type { ReactElement } from "react"
import * as React from "react"
import "../styles.css"

import { ThemeProvider, useThemeUI } from "theme-ui"
import theme from "./theme"

const MouseWiggler: React.FC = () => {
  const context = useThemeUI()

  React.useEffect(() => {
    if (!context) {
      return
    }
    const onMouseMoveListener = (e: MouseEvent) => {
      context.theme.colors.primary = `hsl(${e.clientX}, 100%, 50%)`
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
