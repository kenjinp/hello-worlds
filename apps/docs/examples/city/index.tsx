import { Button } from "@components/button/Button"
import { SafeHydrate } from "@components/safe-render/SafeRender"
import { Noise, remap } from "@hello-worlds/planets"
import * as React from "react"
import { Color, Vector3 } from "three"
import { match } from "ts-pattern"
import { Polygon } from "./lib/math/Polygon"
import { Random } from "./lib/math/Random"
import { Voronoi } from "./lib/math/Voronoi"
import { getCardinalDirectionLabel } from "./lib/math/helpers"
import { CityModel } from "./lib/model/Model"
import { Patch } from "./lib/model/Patch"
import { Castle } from "./lib/ward/Castle"
import { Ward } from "./lib/ward/Ward"

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
              className="patch"
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
              className="patch"
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

function ShowCircumference({ city }: { city: CityModel }) {
  const polygon = CityModel.findCircumference(city.inner)


  const smoothPolygon = (polygon: Polygon) => {
    const smoothFactor = Math.min(1, 40 / city.inner.length)
    polygon.set(
      polygon.vertices.map(v => {
         
            return polygon.smoothVertex(v, smoothFactor)
          }),
        )
        return polygon
  }

  const points = smoothPolygon(polygon).vertices.map(({ x, y }) => `${x},${y}`).join(" ")
  return (
    <polygon
      points={points}
      className="circumference"
      style={{
        fill: "none",
        stroke: "red",
      }}
    />
  )
}

function ShowBorder({ city }: { city: CityModel }) {
  const polygon = city.border?.shape
  const points = polygon?.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
  return (
    <polygon
      points={points}
      className="border"
      style={{
        fill: "none",
        stroke: "blue",
      }}
    />
  )
}

function WallDebug({ city }: { city: CityModel }) {
  const wall = city.wall?.shape
  const points = wall?.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
  const castleWall = (city.citadel?.ward as Castle)?.wall
  const castlePoints = castleWall?.shape.vertices.map(({ x, y }) => `${x},${y}`).join(" ")

  return(
    <>
      {wall?.vertices.map(({ x, y }) => {
        return <circle cx={x} cy={y} r="3" fill="purple" />
      })}
      <polygon
        points={points}
        style={{
          fill: "none",
          stroke: !!city.wall ? "purple" : 'none',
        }}
      />
      {city.gates?.map(({ x, y }) => {
        return <circle cx={x} cy={y} r="2" fill="red" />
      })}
      {city.border?.towers?.map(({ x, y }) => {
        return <circle cx={x} cy={y} r="3" fill="green" />
      })}
      {castlePoints?.length && <>
          {castleWall.towers?.map(({ x, y }) => {
          return <circle cx={x} cy={y} r="2" fill="purple" />
        })}
        {castleWall.gates?.map(({ x, y }) => {
          return <circle cx={x} cy={y} r="2" fill="blue" />
        })}
        <polygon
        points={castlePoints}
        style={{
          fill: "none",
          stroke: "purple",
        }}
      />
    </>
      }
       
      {/* {innerPoints.map(patch => <ShowPatch patch={patch} color={new Color("green")}/>)} */}
    </>
  )
}

function StreetDebug({ city }: { city: CityModel }) {
  // const arteriesPioints = city.arteries.reduce((acc, artery) => {
  //   return [...acc, ...artery.vertices]
  // }, [] as Vector3[]).map(({ x, y }) => `${x},${y}`).join(" ")
  // const streets = city.streets
  return(
    <>
      
      {city.roads.map(({ vertices }) => {
        const points = vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        return (
          <polyline
            points={points}
            style={{
              fill: "none",
              stroke: "BurlyWood",
              strokeLinejoin: "bevel"
              // strokeWidth: 2,
            }}
          />
        )
      })}

      {city.streets.map(({ vertices }, i) => {
        const points = vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        const streetId = `street-${i}`;
        const cardinalDirectionLabel = getCardinalDirectionLabel(
          vertices[0],
          vertices[vertices.length - 1],
        )

        function getLongestSegment() {
          let longest = 0;
          let longestSegment:[Vector3, Vector3] = null;
          for (let i = 0; i < vertices.length - 1; i++) {
            const segment = vertices[i].distanceTo(vertices[i + 1]);
            if (segment > longest) {
              longest = segment;
              longestSegment = [vertices[i], vertices[i + 1]];
            }
          }
          return longestSegment;
        }

        const longestSegment = getLongestSegment();

        const d = `M ${longestSegment[0].x} ${longestSegment[0].y} L ${longestSegment[1].x} ${longestSegment[1].y}`;
        return (
          <>
          <path id={streetId} fill="transparent" d={d} />
          <text width="20">
    <textPath xlinkHref={'#' + streetId} font-size="5px">
      {cardinalDirectionLabel} Street 
    </textPath>
  </text>
          <polyline
            points={points}
            style={{
              fill: "none",
              stroke: new Color(0xa89a8e).getStyle(),
              strokeLinejoin: "bevel"
            }}
          />
          </>
        )
      })}
    </>,
  );
}

function WardDebug({ city }: { city: CityModel }) {
  const random = new Random()
  const noise = new Noise({
    height: 2,
    scale: 300
  })
  const showGeometry = true;
  return(
    <>
      {city.patches.map((patch) => {
        const w = patch.ward
        const point = patch.shape.centroid
        const center = patch.shape.center
        const n = noise.getFromVector(point)
        const lightness = remap(1 -n, 0, 1, 0.25, 0.75);
        const c = new Color(Math.random() * 0xffffff)
        const block = w.getCityBlock();
        const points = block.vertices.map(({ x, y }) => `${x},${y}`).join(" ")

        const shrink = [...patch.shape.vertices].map(v => 1)

        // let q = patch.shape.clone()
        // let blah  = []
        // let newVertices = []
        // patch.shape.forEdge((v1, v2, index) => {
        //   let dd = shrink[index]
        //   if (dd > 0) {
        //   let v = v2.clone().sub(v1)
        //   let n = normalize(perpendicular(v), dd)


        //   const p1 = v1.clone().add(n)
        //   const p2 = v2.clone().add(n)
        //   blah.push({ v, n, dd, p1, p2 })
        //   newVertices.push(p1, p2)
        //   // console.log(v, n, dd, p1, p2)
        //   // q = q.cut(p1, p2, 0)[0]
        //   }
        // })
        // const newPoly = new Polygon(newVertices)
   
        const color = 
          match(w?.getLabel())
          .with("Farm", () => {
            const farms = c.setColorName("wheat")
            const farmHSL = { h: 0, s: 0, l: 0 }
            farms.getHSL(farmHSL)
            return farms.setHSL(farmHSL.h, farmHSL.s, lightness)
          })
          .with("Ward", () => c.setHSL(.24, 0.75 , lightness) )
          .otherwise(() => c.setHSL(.24, 0.75 , lightness) )

        return w ? <>
          <polygon
            key={`${point.x},${point.y}`}
            ref={r => {
              if (r) {
                r.ward = w
                w.svg = r
              }
            }}
            points={points}
            className={`ward ${w.getLabel().toLowerCase()}`}
            style={{
              fill: color.getStyle(),
            }}
          />
            {/* {blah.map(({ p1, p2 }, index) => {
              return <polyline key={index} points={`${p1.x},${p1.y} ${p2.x},${p2.y}`} style={{ stroke: "red", strokeWidth: 1 }} />
            })} */}
            {/* <polygon
            // ref={r => {
            //   if (r) {
            //     r.ward = w
            //     w.svg = r
            //   }
            // }}
            points={newPoly.vertices.map(({ x, y }) => `${x},${y}`).join(" ")}
            style={{
              fill: "pink",
              // stroke: "red",
            }}
            /> */}
          </>
           : null
      })}

      {/* buildings stuff */}

      {showGeometry && city.patches.map(i => i?.ward?.geometry.map((building, buildingIndex) => {
    const points = building.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
    const hue = random.float()
    const color = new Color().setHSL(hue, 0.5, 0.5)
    return (
      <polygon
        key={`${buildingIndex}`}
        points={points}
        style={{
          fill: color.getStyle(),
          // stroke: "black",
          // stroke: color.setHSL(hue, 0.5, 0.2).getStyle()
        }}
        key={buildingIndex}
      />

    )
  }))}
    </>
  );
}

function CityLabels ({ city }: { city: CityModel }) {
  return <>
   {city.patches.filter(p => !(p.ward.getLabel() === "Ward")).map((patch) => {
        const w = patch.ward
        const point = patch.shape.centroid
        const center = patch.shape.center
        const points = patch.shape.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        const label = w?.getLabel()

        

    

        return w ? <React.Fragment key={
          `${point.x},${point.y}`
        }>
          
          <g transform={`translate(${center.x - 10}, ${center.y - 10})`}>
    <foreignObject width="20" height="20">
        <div css={`

align-items: center;
font-size: 2px;
justify-content: center;
width: 100%;
height: 100%;
display: flex;

        `}>
          <div>

          <b>{label}</b>
          </div>
        </div>
    </foreignObject>
  </g>
          </React.Fragment>
           : null
      })}
  
  </>
}

const getCenterPositionOfScreen = () => {
  const { innerWidth, innerHeight } = window
  return new Vector3(innerWidth / 2, innerHeight / 2, 0)
}

function CityDebug() {
  const [center] = React.useState(getCenterPositionOfScreen())
  const numPatches = 40
  const [city, setCity] = React.useState(() => new CityModel(numPatches, center))
  const [voronoi, setVoronoi] = React.useState<Voronoi>(null)
  const [svg, setSvg] = React.useState<SVGSVGElement>(null)
  const [rerender, setRerender] = React.useState(0)
  const [scale, setScale] = React.useState(0.1)


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

  React.useEffect(() =>{
    const enterKeyPressListener = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setCity(new CityModel(numPatches, center))
      }
    }
    const scrollListener = (e: WheelEvent) => {
      console.log(e)


      setScale(scale + e.deltaY * 0.001)
    }
    window.addEventListener('keypress', enterKeyPressListener)
    window.addEventListener('wheel', scrollListener)
    return () => {
      window.removeEventListener('keypress', enterKeyPressListener)
      window.removeEventListener('wheel', scrollListener)
    }
  })

  console.log({ city })

  const scaledCenter = center.clone().multiplyScalar(scale)

  const CityDebug = React.useMemo(() => {
    return city ? (
      <>
        <ShowPatches city={city} />
        {/* <CityCircumference city={city} /> */}
        {/* <WardDebug city={city} /> */}
        <WallDebug city={city} />
        <StreetDebug city={city} />
        <CityLabels city={city} />
        <ShowCircumference city={city} />
        <ShowBorder city={city} />
      </>
    ) : null
  }, [city])

  return (
    <>
    {/* <UncontrolledReactSVGPanZoom
        ref={Viewer}
        width={500} height={500}
        onZoom={e => console.log('zoom')}
        onPan={e => console.log('pan')}
        onClick={event => console.log('click', event.x, event.y, event.originalEvent)}
      > */}

    <svg
      viewBox={`0 0 ${window.innerWidth * scale} ${window.innerHeight * scale}`}
      ref={handleRect}
      // onClick={e => {
      //   // if (!voronoi) { return; }
      //   // const rect = e.currentTarget.getBoundingClientRect()
      //   // const x = e.clientX - rect.left
      //   // const y = e.clientY - rect.top
      //   // console.log(x, y)
      //   // voronoi.addPoint(new Vector3(x, y, 0))
      //   // setRerender(rerender + 1)
      //   setCity(new CityModel(numPatches, center))
      // }}
      
      style={{ width: "100vw", height: "100vh" }}
    >
      <g transform={`translate(${scaledCenter.x}, ${scaledCenter.y})`}>
      {CityDebug}
      </g>
    </svg>
        {city && <header style={{ position: "fixed", top:0}}>
        {city.wallsNeeded && "walls"} | {city.citadelNeeded && "citadel"} | {city.plazaNeeded && "plaza"}</header>}
        {/* </UncontrolledReactSVGPanZoom> */}
    
    </>

  )
}


export function PolygonPlayground () {
  const [points, setPoints] = React.useState<Vector3[]>([])
  const [polygons, setPolygons] = React.useState<Polygon[]>([])
  const [svg, setSvg] = React.useState<SVGSVGElement>(null)
  const [placingPolygons, setPlacingPolygons] = React.useState(false)
  const [cutting, setCutting] = React.useState(false)
  const [cuttingPoints, setCuttingPoints] = React.useState<Vector3[]>([])

  const handlePlacePolygonPoints = () => {
    if (!svg) { return; }
    if (placingPolygons) {

      setPlacingPolygons(false)
      setPolygons([new Polygon(points)])      
    } else {
      setPlacingPolygons(true)
      setPolygons([])
      setPoints([])
    }
  }

  const handleCutPolygon = () => {
    if (!svg) { return; }
    if (cutting) {
      setCutting(false)
      setCuttingPoints([])
    } else {
      setCutting(true)
      setCuttingPoints([])
    }
  }

  const handleCanvasClick = (e) => {
    if (!svg) { return; }
    if (placingPolygons) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setPoints([...points, new Vector3(x, y, 0)])
    }
    if (cutting) {
      if (cuttingPoints.length === 2) {
        setCutting(false)
        setPolygons(polygons.reduce((memo, p) => [...memo,...p.cut(cuttingPoints[0], cuttingPoints[1], 20)], []))
      } else {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setCuttingPoints([...cuttingPoints, new Vector3(x, y, 0)])
      }
    } else {
      setCuttingPoints([])
    }
  }

  const handleRect = React.useCallback(node => {
    setSvg(node)
  }, [])

  console.log({ polygons })

  return <>
    <header style={{ position: "fixed", top:0}}>
      <Button
        onClick={handlePlacePolygonPoints}
        >{placingPolygons ? "Stop Placing Points" : "Place Polygon Points"}
      </Button>{" | "}
      <Button
        onClick={handleCutPolygon}
        >{cutting ? "Cutting in progress" : "Cut Polygon"}
      </Button>
    </header>
  <svg
  // viewBox="-500 -500 1000 1000"
  ref={handleRect}
  onClick={handleCanvasClick}
  style={{ width: "100vw", height: "100vh" }}
>
  {polygons.map((polygon, polygonIndex) => {
    const random = new Random()
    const points = polygon.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
    const minSq = polygon.square / 4 * random.float() * random.float()
    const gridChaos = 0.6 + random.float() * 0.4;
    const sizeChaos = 0.8;
    const buildings = Ward.createAlleys(polygon, minSq, gridChaos, sizeChaos)
    // const peel = polygon.peel(polygon.vertices[0], 20)
    console.log({ buildings })
    return (
      <>
      
      <polyline
        points={points}
        style={{
          fill: polygon.isConvex() ?  polygonIndex === 0 ? "green": "palegreen" : "red",
          stroke: "blue",
        }}
      />
      {buildings.map((building, buildingIndex) => {
        const points = building.vertices.map(({ x, y }) => `${x},${y}`).join(" ")
        const hue = random.float()
        const color = new Color().setHSL(hue, 0.5, 0.5)
        return (
          <polyline
            points={points}
            style={{
              fill: color.getStyle(),
              stroke: color.setHSL(hue, 0.5, 0.2).getStyle()
            }}
            key={buildingIndex}
          />
        )
      })}

      {/* <polyline
        points={peel.vertices.map(({ x, y }) => `${x},${y}`).join(" ")}
        style={{
          fill: "purple",
        }}
      /> */}
      {polygon.vertices.map(({ x, y }, i) => {
        return (<>
        <text x={x} y={y}>{x}, {y} (polygon-{polygonIndex})</text>
        <circle cx={x} cy={y} r={5} fill="blue" key={i} />
        </>)
      })}
      {/* <polyline
        points={`${peel.start.x},${peel.start.y} ${peel.end.x},${peel.end.y}`}
        style={{
          fill: "none",
          stroke: "purple",
          strokeWidth: 2
        }}
      /> */}
      </>
      
      )
  })}
  {points.map(({ x, y }, i) => {
    return <circle cx={x} cy={y} r={5} fill="green" key={i} />
  })}
  {cuttingPoints.map(({ x, y }, i) => {
    return <circle cx={x} cy={y} r={5} fill="red" key={i} />
  })}
  {cuttingPoints.length === 2 && (<polyline 
    points={`${cuttingPoints[0].x},${cuttingPoints[0].y} ${cuttingPoints[1].x},${cuttingPoints[1].y}`}
    style={{
      fill: "none",
      stroke: "red",
    }}
  ></polyline>)}
</svg>
</>
}

export const ExampleInner: React.FC = () => {
  const [showCanvas, setShowCanvas] = React.useState(false)
  return (
    <SafeHydrate>
      {/* {showCanvas && (
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
      )} */}
      <CityDebug />
      {/* <PolygonPlayground /> */}
    </SafeHydrate>
  )
}

export const Example = React.memo(ExampleInner)
