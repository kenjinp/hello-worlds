import ExampleLayout from "@components/layouts/example/Example"
import { SafeHydrate } from "@components/safe-render/SafeRender"
import { SpaceBox } from "@components/space-box/SpaceBox"
import { GodCamera } from "@game/cameras/GodCamera"
import { Canvas } from "@game/Canvas"
import { SystemMap } from "@game/docs/SystemMap"
import { AtmosphereEffects } from "@game/effects/Atmosphere.effects"
import { OceanEffects } from "@game/effects/Ocean.effects"
import { System } from "@game/Generator"
import { AU } from "@game/Math"
import { KeyboardController } from "@game/player/KeyboardController"
import { PostProcessing } from "@game/Postprocessing"
import { CameraEntity } from "@game/render/Camera"
import { PhysicsBoxes } from "@game/render/PhysicsBox"
import { Planets } from "@game/render/Planets"
import { Stars } from "@game/render/Stars"
import { RenderMinimizedWindows, RenderWindows } from "@game/render/Window"
import { WorldSystems } from "@game/WorldSystems"
import { Stars as FarStars } from "@react-three/drei"
import { Debug, Physics } from "@react-three/rapier"
import * as React from "react"
import { Vector3 } from "three"

export const PlanetariumInner: React.FC = () => {
  return (
    <SafeHydrate>
      <System />
      <SystemMap />
      <RenderWindows />
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
              <div style={{ marginRight: "1em" }}>
                <RenderMinimizedWindows />
              </div>
            </div>
          </>
        }
      >
        <Canvas>
          <React.Suspense fallback={null}>
            <KeyboardController>
              <Physics timeStep="vary" gravity={[0, 0, 0]}>
                <group>
                  <Debug />
                  <group
                    scale={new Vector3(1, 1, 1)
                      .multiplyScalar(AU)
                      .multiplyScalar(10)}
                  >
                    <FarStars saturation={1} />
                  </group>

                  <SpaceBox />
                  {/* <FlyCamera /> */}

                  <PostProcessing>
                    <group>
                      {/* <Attractor
                      type="linear"
                      range={EARTH_RADIUS * 2}
                      strength={10000000000000}
                      position={new Vector3()}
                    /> */}
                      <GodCamera initialLongLat={[0, 0]} />
                      <CameraEntity />
                      {/* <Players /> */}
                      <Stars />
                      <Planets />
                      <PhysicsBoxes />
                      <WorldSystems />
                    </group>
                    <AtmosphereEffects>
                      <OceanEffects />
                    </AtmosphereEffects>
                  </PostProcessing>
                </group>
              </Physics>
            </KeyboardController>
          </React.Suspense>
        </Canvas>
      </ExampleLayout>
    </SafeHydrate>
  )
}

export const Planetarium = React.memo(PlanetariumInner)