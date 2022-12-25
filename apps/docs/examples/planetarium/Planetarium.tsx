import ExampleLayout from "@components/layouts/example/Example"
import { SafeHydrate } from "@components/safe-render/SafeRender"
import { SpaceBox } from "@components/space-box/SpaceBox"
import FlyCamera from "@game/cameras/FlyCamera"
import { Canvas } from "@game/Canvas"
import { SystemMap } from "@game/docs/SystemMap"
import { AtmosphereEffects } from "@game/effects/Atmosphere.effects"
import { OceanEffects } from "@game/effects/Ocean.effects"
import { SystemGenerator } from "@game/Generator"
import { AU } from "@game/Math"
import { PostProcessing } from "@game/Postprocessing"
import { Planets } from "@game/render/Planets"
import { Stars } from "@game/render/Stars"
import { RenderWindows } from "@game/render/Window"
import { Stars as FarStars } from "@react-three/drei"
import { Leva } from "leva"
import * as React from "react"
import { Vector3 } from "three"

let fired = false
export const PlanetariumInner: React.FC = () => {
  const [showLeva, setShowLeva] = React.useState(false)

  console.log("rerendering planetarium")

  React.useEffect(() => {
    const system = new SystemGenerator()
    return () => void system.destroy()
  }, [])

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!fired) {
        fired = true
        if (e.key === "c") {
          setShowLeva(!showLeva)
        }
      }
    }
    const onUpListener = (e: KeyboardEvent) => {
      fired = false
    }

    document.addEventListener("keydown", listener)
    document.addEventListener("keyup", onUpListener)
    return () => {
      document.removeEventListener("keydown", listener)
      document.removeEventListener("keyup", onUpListener)
    }
  }, [showLeva])

  return (
    <SafeHydrate>
      <Leva hidden={!showLeva} />
      <ExampleLayout
        middle={
          <>
            {/* <div
              style={{
                position: "relative",
                bottom: 0,
                left: 0,
                zIndex: 100,
                padding: "1em",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span>Pause Camera (P)</span>
            </div> 
            */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* <Button onClick={() => setShowLeva(!showLeva)}>
                show ocean config
              </Button>{" "} */}
              {/* <div style={{ marginRight: "1em" }}>
                <RenderMinimizedWindows />
              </div> */}
              <div style={{ marginRight: "1em" }}>Ocean config (C)</div>
              <div>Pause camera (P)</div>
            </div>
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
          </>
        }
      >
        <Canvas>
          <group
            scale={new Vector3(1, 1, 1).multiplyScalar(AU).multiplyScalar(10)}
          >
            <FarStars saturation={1} />
          </group>
          <SpaceBox />
          <FlyCamera />
          <PostProcessing>
            <Stars />
            <Planets />
            <AtmosphereEffects>
              <OceanEffects />
            </AtmosphereEffects>
          </PostProcessing>
        </Canvas>
      </ExampleLayout>
    </SafeHydrate>
  )
}

export const Planetarium = React.memo(PlanetariumInner)
