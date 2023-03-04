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
import { Color, Euler, Vector3 } from "three"
import { ExampleLand } from "./Land"
import { Voronoi } from "./lib/math/Voronoi"
import { CityModel } from "./lib/model/Model"

function CityDebug() {
  const [city, setCity] = React.useState(() => new CityModel())
  const [voronoi, setVoronoi] = React.useState<Voronoi>(null)
  const [svg, setSvg] = React.useState<SVGSVGElement>(null)
  const [rerender, setRerender] = React.useState(0)
  React.useLayoutEffect(() => {
    console.log({ svg })
    if (svg) {
      const rect = svg.getBoundingClientRect()
      console.log({ svg, rect })
      setVoronoi(new Voronoi(0, 0, rect.width, rect.height))
    }
  }, [svg])

  const handleRect = React.useCallback(node => {
    setSvg(node)
  }, [])

  console.log({ city })

  return (
    <svg
      viewBox="-500 -500 1000 1000"
      ref={handleRect}
      onClick={e => {
        // if (!voronoi) { return; }
        // const rect = e.currentTarget.getBoundingClientRect()
        // const x = e.clientX - rect.left
        // const y = e.clientY - rect.top
        // console.log(x, y)
        // voronoi.addPoint(new Vector3(x, y, 0))
        // setRerender(rerender + 1)
        setCity(new CityModel(15, new Vector3(), "banana"))
      }}
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* {voronoi && voronoi.triangles.map((triangle, i) => {
          const [ax, ay, ] = triangle.p1.toArray()
          const [bx, by, ] = triangle.p2.toArray()
          const [cx, cy, ] = triangle.p3.toArray()
          const center = triangle.c
          const blah = triangle.midpoint()
          return <React.Fragment key={i}>
          <circle cx={center.x} cy={center.y} r="5" fill="red" />
          <circle cx={blah.x} cy={blah.y} r="10" fill="blue" />
          <polygon points={`${ax},${ay} ${bx},${by} ${cx},${cy}`} className="triangle" style={{ fill: "#00ff0012", stroke: 'blue'}}/>
          </React.Fragment>
        })}               */}
      {/* {city &&
        city.voronoi.triangles.map((triangle, i) => {
          const [ax, ay] = triangle.p1.toArray()
          const [bx, by] = triangle.p2.toArray()
          const [cx, cy] = triangle.p3.toArray()
          const center = triangle.c
          const blah = triangle.midpoint()
          return (
            <React.Fragment key={i}>
              <circle cx={center.x} cy={center.y} r="10" fill="red" />
              <circle cx={blah.x} cy={blah.y} r="10" fill="blue" />
              <polygon
                points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
                className="triangle"
                style={{ fill: "#00ff0012", stroke: "blue" }}
              />
            </React.Fragment>
          )
        })} */}
      {city &&
        city.patches.map(({ shape, withinWalls, withinCity }, i) => {
          const insideCity = new Color("red")
          const outsideCity = new Color("blue")
          const color = new Color().setHSL(Math.random(), 1, 0.5)
          const points = shape.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
          // const [ax, ay] = triangle.p1.toArray()
          // const [bx, by] = triangle.p2.toArray()
          // const [cx, cy] = triangle.p3.toArray()
          // const center = triangle.c
          // const blah = triangle.midpoint()
          // const points =
          return (
            <React.Fragment key={i}>
              {/* <circle cx={center.x} cy={center.y} r="10" fill="red" />
              <circle cx={blah.x} cy={blah.y} r="10" fill="blue" /> */}
              <polygon
                points={points}
                className="triangle"
                style={{
                  fill: withinCity ? insideCity.getStyle() : undefined,
                  stroke: "blue",
                }}
              />
            </React.Fragment>
          )
        })}
    </svg>
  )
}

export const ExampleInner: React.FC = () => {
  const [showCanvas, setShowCanvas] = React.useState(false)
  return (
    <SafeHydrate>
      {showCanvas && (
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
                      <group
                        position={new Vector3(0, -1, 0).multiplyScalar(1000)}
                        rotation={new Euler().setFromVector3(
                          new Vector3(-Math.PI / 2, 0, 0),
                        )}
                      >
                        <ExampleLand />
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
      )}
      <CityDebug />
    </SafeHydrate>
  )
}

export const Example = React.memo(ExampleInner)
