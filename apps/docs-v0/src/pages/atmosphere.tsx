import BrowserOnly from "@docusaurus/BrowserOnly"
import * as React from "react"

const LazyAtmosphere = React.lazy(
  () => import("../experiments/atmosphere/Atmosphere"),
)

export default function () {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <LazyAtmosphere />
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}
