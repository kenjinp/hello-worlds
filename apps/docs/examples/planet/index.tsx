import BrowserOnly from "@docusaurus/BrowserOnly"
import * as React from "react"

const Lazy = React.lazy(() => import("./Planet.tsx"))

export default function ({ noiseType }) {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <Lazy noiseType={noiseType} />
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}
