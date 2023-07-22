import ExampleLayout from "@components/layouts/example/Example"
import { SafeHydrate } from "@components/safe-render/SafeRender"
import { SpaceBox } from "@components/space-box/SpaceBox"
import { NormalCanvas } from "@game/Canvas"
import { AU } from "@game/Math"
import { KeyboardController } from "@game/player/KeyboardController"
import { Atmosphere } from "@hello-worlds/vfx"
import { Stars as FarStars } from "@react-three/drei"
import { EffectComposer } from "@react-three/postprocessing"
import { Physics } from "@react-three/rapier"
import { Perf } from "r3f-perf"
import * as React from "react"
import * as THREE from "three"
import { acceleratedRaycast } from "three-mesh-bvh"
import { Moon } from "./Moon"
import { UITunnel } from "./UI.tunnel"
const { Color, Vector3 } = THREE

THREE.Mesh.prototype.raycast = acceleratedRaycast

const sunDistance = 10000
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
      position: new Vector3(1, 0, 1).multiplyScalar(sunDistance),
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

  const showAtmo = true
  const showPerf = false
  const radius = 500 // MARS_RADIUS

  return (
    <SafeHydrate>
      <ExampleLayout
        middle={
          <div>
            <div>Moon: Terrain Features</div>|<UITunnel.Out />
          </div>
        }
      >
        <NormalCanvas>
          {showPerf && <Perf />}
          <React.Suspense fallback={null}>
            <KeyboardController>
              <Physics gravity={[0, 0, 0]}>
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
                    console.log({ SUN: position })
                    return (
                      <group position={position} key={index}>
                        <directionalLight
                          key={`sun-${index}`}
                          color={color}
                          intensity={intensity / 10}
                          castShadow
                        />
                        <mesh>
                          <sphereGeometry args={[500]}></sphereGeometry>
                          <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={10}
                          ></meshStandardMaterial>
                        </mesh>
                      </group>
                    )
                  })}
                  <group>
                    <Moon radius={radius} />
                  </group>
                  <EffectComposer>
                    {showAtmo ? (
                      <Atmosphere
                        planets={[
                          {
                            radius: radius - radius * 0.001,
                            origin: new Vector3(),
                            atmosphereRadius: radius * 2,
                            // limited from 0 to 1.0
                            atmosphereDensity: 0.06,
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
                    ) : null}
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
