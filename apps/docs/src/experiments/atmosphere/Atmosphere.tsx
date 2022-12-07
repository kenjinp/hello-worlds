import BasicScene from "@site/src/components/BasicScene"
import { Button } from "@site/src/components/button/Button"
import { Planets } from "@site/src/components/world-builder/render/Planets"
import { Stars } from "@site/src/components/world-builder/render/Stars"
import * as React from "react"
import { AtmosphereEffects } from "./Atmosphere.effects"
import { AtmosphereGenerator } from "./Atmosphere.generator"

const AtmosphereExperiment: React.FC = () => {
  const [atmosphereGenerator] = React.useState(new AtmosphereGenerator())
  React.useEffect(() => {
    document.addEventListener("keydown", e => {
      if (e.key === "k") {
        atmosphereGenerator.randomizeSuns()
      }
    })
    return () => {
      atmosphereGenerator.destroy()
    }
  }, [])

  return (
    <div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 100,
          padding: "1em",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button onClick={atmosphereGenerator.randomizeSuns}>
          Randomize Suns (press K)
        </Button>
      </div>
      <BasicScene>
        <Stars />
        <Planets />
        <AtmosphereEffects />
      </BasicScene>
    </div>
  )
}

export default AtmosphereExperiment
