import ExampleLayout from "@components/layouts/example/Example"
import { SafeHydrate } from "@components/safe-render/SafeRender"
import { SpaceBox } from "@components/space-box/SpaceBox"
import { NormalCanvas } from "@game/Canvas"
import { AU, MOON_RADIUS } from "@game/Math"
import { KeyboardController } from "@game/player/KeyboardController"
import { Atmosphere } from "@hello-worlds/vfx"
import { Stars as FarStars } from "@react-three/drei"
import { EffectComposer } from "@react-three/postprocessing"
import { Debug, Physics } from "@react-three/rapier"
import * as React from "react"
import { Color, Vector3 } from "three"
import { Moon } from "./Moon"

export const ExampleInner: React.FC = () => {
  return (
    <SafeHydrate>
      <ExampleLayout middle={<>Moon</>}>
        <NormalCanvas>
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
                    position={new Vector3(1, 1, 1).multiplyScalar(AU)}
                  />
                  <group>
                    <Moon />
                  </group>
                  <EffectComposer>
                    <Atmosphere
                      planets={[
                        {
                          radius: MOON_RADIUS,
                          origin: new Vector3(),
                          atmosphereRadius: MOON_RADIUS * 2,
                          atmosphereDensity: 0.5,
                        },
                      ]}
                      suns={[
                        {
                          origin: new Vector3(1, 1, 1).multiplyScalar(AU),
                          color: new Vector3().fromArray(
                            new Color(0xffffff).toArray(),
                          ),
                          intensity: 1,
                        },
                      ]}
                    />
                  </EffectComposer>
                </group>
              </Physics>
            </KeyboardController>
          </React.Suspense>
        </NormalCanvas>
      </ExampleLayout>
    </SafeHydrate>
  )
}

export const Example = React.memo(ExampleInner)
