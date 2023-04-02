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
import { Patch } from "./lib/model/Patch"

function CityCircumference({ city }: { city: CityModel }) {
  // const [first, ...rest] = city.patches
  // city.patches[0] = new Patch(
  //   CityModel.findCircumference(city.patches).vertices,
  // )
  const polygon = CityModel.findCircumference(city.patches)
  const color = new Color("green")
  const points = polygon.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
  // const [ax, ay] = triangle.p1.toArray()
  // const [bx, by] = triangle.p2.toArray()
  // const [cx, cy] = triangle.p3.toArray()
  // const center = triangle.c
  // const blah = triangle.midpoint()
  // const points =
  console.log({ points })
  return (
    <React.Fragment>
      {polygon.vertices.map(({ x, y }, i) => {
        return <circle cx={x} cy={y} r="10" fill="blue" />
      })}
    </React.Fragment>
  )
}

function ShowPatch({ patch, color }: { patch: Patch; color: Color }) {
  const points = patch.shape.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
  return (
    <>
      <polygon
        points={points}
        className="triangle"
        style={{
          fill: color.getStyle(),
        }}
      />
    </>
  )
}

function ShowPatches({ city }: { city: CityModel }) {
  return (
    <>
      {city.patches.map(({ shape, withinWalls, withinCity }, i) => {
        const insideCity = "#800000bb"
        // const outsideCity = new Color("blue")
        const color = new Color().setHSL(i / city.patches.length, 1, 0.5)
        const points = shape.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        // const [ax, ay] = triangle.p1.toArray()
        // const [bx, by] = triangle.p2.toArray()
        // const [cx, cy] = triangle.p3.toArray()
        // const center = triangle.c
        // const blah = triangle.midpoint()
        // const points =
        return i !== 0 ? (
          <React.Fragment key={i}>
            {/* <circle cx={center.x} cy={center.y} r="10" fill="red" />
          <circle cx={blah.x} cy={blah.y} r="10" fill="blue" /> */}
            <polygon
              points={points}
              className="triangle"
              style={{
                fill: color.getStyle(),
                // stroke: "blue",
              }}
            />
          </React.Fragment>
        ) : (
          <React.Fragment key={i}>
            {/* <circle cx={center.x} cy={center.y} r="10" fill="red" />
      <circle cx={blah.x} cy={blah.y} r="10" fill="blue" /> */}
            <polygon
              points={points}
              className="triangle"
              style={{
                fill: "purple",
                // stroke: "blue",
              }}
            />
          </React.Fragment>
        )
      })}
    </>
  )
}

function WallDebug({ city }: { city: CityModel }) {
  const wall = city.border?.shape
  const points = wall?.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
  return(
    <>
      {wall?.vertices.map(({ x, y }) => {
        return <circle cx={x} cy={y} r="3" fill="purple" />
      })}
      <polygon
        points={points}
        className="triangle"
        style={{
          fill: "none",
          stroke: !!city.wall ? "purple" : 'none',
        }}
      />
      {city.gates?.map(({ x, y }) => {
        return <circle cx={x} cy={y} r="4" fill="red" />
      })}
      {city.border?.towers?.map(({ x, y }) => {
        return <circle cx={x} cy={y} r="3" fill="green" />
      })}
      {/* {innerPoints.map(patch => <ShowPatch patch={patch} color={new Color("green")}/>)} */}
    </>,
  )
}

function StreetDebug({ city }: { city: CityModel }) {
  const streets = city.streets
  return(
    <>
      {streets.map(({ vertices }) => {
        const points = vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        return (
          <polyline
            points={points}
            className="triangle"
            style={{
              fill: "none",
              stroke: "blue",
            }}
          />
        )
      })}
      {city.arteries.map(({ vertices }) => {
        const points = vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        return (
          <polyline
            points={points}
            className="triangle"
            style={{
              fill: "none",
              stroke: "purple",
            }}
          />
        )
      })}
    </>,
  );
}

function WardDebug({ city }: { city: CityModel }) {
  return(
    <>
      {city.border ? city.patches.map((patch) => {
        const w = patch.ward
        const point = patch.shape.centroid
        const points = patch.shape.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        return w ? <>
          <polyline
            points={points}
            className="triangle"
            style={{
              fill: "blue",
            }}
          />
          <text x={point.x} y={point.y}>{w.getLabel()}</text>
          </>
           : null
      }) : null}
    </>,
  );
}

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
    <>
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
        setCity(new CityModel())
      }}
      style={{ width: "100vw", height: "100vh" }}
    >
      {city && (
        <>
          <ShowPatches city={city} />
          {/* <CityCircumference city={city} /> */}
          <WallDebug city={city} />
          <StreetDebug city={city} />
          <WardDebug city={city} />
        </>
      )}
    </svg>
        {city && <header style={{ position: "fixed", top:0}}>{city.wallsNeeded && "walls"} | {city.citadelNeeded && "citadel"} | {city.plazaNeeded && "plaza"}</header>}
    </>

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
