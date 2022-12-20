import BrowserOnly from "@docusaurus/BrowserOnly"
import * as React from "react"

const Example = React.lazy(() => import("./RingWorld.tsx"))

export function RingWorldExampleThin() {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <Example type="thin" />
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}

export function RingWorldExampleLong() {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <Example type="long" />
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}
