import BrowserOnly from "@docusaurus/BrowserOnly"
import * as React from "react"

const Lazy = React.lazy(() => import("./FlatWorld.tsx"))

export default function () {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <Lazy />
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}
