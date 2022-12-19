import BrowserOnly from "@docusaurus/BrowserOnly"
import * as React from "react"
import BasicScene from "../components/BasicScene"

const LazyWorldbuilder = React.lazy(
  () => import("../experiments/tectonics/Tectonics"),
)

export default function () {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <BasicScene>
              <LazyWorldbuilder />
            </BasicScene>
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}
