import BasicScene from "@site/src/components/BasicScene"
import { Button } from "@site/src/components/button/Button"
import { Planets } from "@site/src/components/world-builder/render/Planets"
import { Stars } from "@site/src/components/world-builder/render/Stars"
import * as React from "react"
import { AtmosphereEffects } from "./Atmosphere.effects"
import { AtmosphereGenerator } from "./Atmosphere.generator"
import FlyCamera from "./FlyCamera"
import { OceanEffects } from "./Ocean.effects"
import { SystemMap } from "./SystemMap"
import { RenderMinimizedWindows, RenderWindows } from "./Window"

// const showMap = () => {
//   queue(() => {
//     console.log("show map?")
//     const systemMap = world
//       .with("window")
//       .entities.find(e => e.id === "system map")
//     if (!systemMap) return
//     let func
//     if (systemMap.minimized) {
//       func = () => world.removeComponent(systemMap, "minimized")
//     } else {
//       func = () => world.addComponent(systemMap, "minimized", true)
//     }
//     func()
//   })
// }

// const listener = (e: KeyboardEvent) => {
//   if (e.key === "t") {
//     console.log("key press")
//     showMap()
//   }
// }
// world.add({
//   id: "system map",
//   minimized: true,
//   window: true,
//   header: "System Map ( m)",
//   // content: <SystemExplorer />,
// })
// document.addEventListener("keyup", listener)

// const loop = () => {
//   queue.flush()
//   requestAnimationFrame(loop)
// }

// loop()

const AtmosphereExperiment: React.FC = () => {
  const [atmo] = React.useState(() => new AtmosphereGenerator())
  // const atmoRef = React.useRef<AtmosphereGenerator>(new AtmosphereGenerator())

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
        <RenderMinimizedWindows />
        <Button onClick={() => atmo.randomizeSuns()}>Randomize Suns</Button>
      </div>
      <BasicScene>
        <Stars />
        <Planets />
        <AtmosphereEffects />
        <OceanEffects />
        <FlyCamera />
      </BasicScene>
      <div
        id="window-bounds"
        style={{
          zIndex: 101,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <SystemMap />
        <RenderWindows />
      </div>
    </div>
  )
}

export default AtmosphereExperiment
