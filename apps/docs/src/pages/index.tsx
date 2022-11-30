import BrowserOnly from "@docusaurus/BrowserOnly"
import * as React from "react"

const LazyWorldbuilder = React.lazy(
  () => import("../components/world-builder/WorldBuilder"),
)

export default function () {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <LazyWorldbuilder />
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}
