import BrowserOnly from "@docusaurus/BrowserOnly"
import ExampleWrapper from "@site/src/components/examples/ExampleWrapper"
import * as React from "react"

const Example = React.lazy(() => import("./Tectonics.tsx"))

export default function ({ noiseType }) {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <ExampleWrapper
              link="https://github.com/kenjinp/hello-worlds/tree/main/apps/docs/src/experiments/tectnonics"
              controls={null}
            >
              <Example />
            </ExampleWrapper>
          </React.Suspense>
        )
      }}
    </BrowserOnly>
  )
}
