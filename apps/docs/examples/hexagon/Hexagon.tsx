import ExampleLayout from "@components/layouts/example/Example"
import { SafeHydrate } from "@components/safe-render/SafeRender"
import { SpaceBox } from "@components/space-box/SpaceBox"
import { Canvas } from "@game/Canvas"
import { AtmosphereEffects } from "@game/effects/Atmosphere.effects"
import { OceanEffects } from "@game/effects/Ocean.effects"
import { AU } from "@game/Math"
import { KeyboardController } from "@game/player/KeyboardController"
import { PostProcessing } from "@game/Postprocessing"
import { Stars as FarStars } from "@react-three/drei"
import { Debug, Physics } from "@react-three/rapier"
import * as React from "react"
import { Color, Vector3 } from "three"
import { Example } from "./Planet"

export const HexagonInner: React.FC = () => {
  return (
    <SafeHydrate>
      <ExampleLayout middle={<>Hexagon Spatial Hashing</>}>
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
                  <directionalLight
                    color={new Color("white")}
                    intensity={0.4}
                  />
                  <PostProcessing>
                    <group>
                      <Example />
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

export const Hexagon = React.memo(HexagonInner)
