import ExampleLayout from "@components/layouts/example/Example"
import { SafeHydrate } from "@components/safe-render/SafeRender"
import { SpaceBox } from "@components/space-box/SpaceBox"
import { NormalCanvas } from "@game/Canvas"
import { AU, MARS_RADIUS } from "@game/Math"
import { KeyboardController } from "@game/player/KeyboardController"
import { Atmosphere } from "@hello-worlds/vfx"
import { Stars as FarStars } from "@react-three/drei"
import { EffectComposer } from "@react-three/postprocessing"
import { Physics } from "@react-three/rapier"
import { Perf } from "r3f-perf"
import * as React from "react"
import { Color, Vector3 } from "three"
import { Moon } from "./Moon"

const generateSuns = () => {
  // return new Array(randInt(1, 3)).fill(0).map(() => {
  //   return {
  //     color: new Color(Math.random() * 0xffffff),
  //     position: new Vector3()
  //       .randomDirection()
  //       .multiply(new Vector3(1, 0, 1))
  //       .multiplyScalar(AU),
  //     intensity: randFloat(4, 40),
  //   }
  // })
  return new Array(1).fill(0).map(() => {
    return {
      color: new Color(0xffffff),
      position: new Vector3(1, 0, 1).multiplyScalar(AU),
      intensity: 10,
    }
  })
}

export const ExampleInner: React.FC = () => {
  const [suns, setSuns] = React.useState(generateSuns())

  React.useEffect(() => {
    const changeSuns = (ev: KeyboardEvent) => {
      if (ev.key === "Enter") {
        setSuns(generateSuns())
      }
    }
    document.addEventListener("onKeyPress", changeSuns)

    return () => {
      document.removeEventListener("onKeyPress", changeSuns)
    }
  }, [])

  return (
    <SafeHydrate>
      <ExampleLayout middle={<>Moon</>}>
        <NormalCanvas>
          <Perf />
          <React.Suspense fallback={null}>
            <KeyboardController>
              <Physics timeStep="vary" gravity={[0, 0, 0]}>
                <group>
                  <group
                    scale={new Vector3(1, 1, 1)
                      .multiplyScalar(AU)
                      .multiplyScalar(10)}
                  >
                    <FarStars saturation={1} />
                  </group>

                  <SpaceBox />
                  {suns.map(({ color, intensity, position }, index) => {
                    return (
                      <directionalLight
                        key={`sun-${index}`}
                        color={color}
                        intensity={intensity / 10}
                        position={position}
                      />
                    )
                  })}
                  <group>
                    <Moon radius={MARS_RADIUS} />
                  </group>
                  <EffectComposer>
                    <Atmosphere
                      planets={[
                        {
                          radius: MARS_RADIUS - 2_000,
                          origin: new Vector3(),
                          atmosphereRadius: MARS_RADIUS * 2,
                          // limited from 0 to 1.0
                          atmosphereDensity: 0.5,
                        },
                      ]}
                      suns={suns.map(({ color, intensity, position }) => {
                        return {
                          origin: position,
                          color: new Vector3().fromArray(color.toArray()),
                          intensity,
                        }
                      })}
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
