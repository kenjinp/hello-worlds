import { Html, OrbitControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Color, Euler, Vector3 } from "three"
import { Voronoi } from "./lib/math/Voronoi"
import { CityModel } from "./lib/model/Model"


const worker = () => new Worker(new URL("./Land.worker", import.meta.url))

export const ExampleLand: React.FC = () => {
  const camera = useThree(s => s.camera)
  const [city] = React.useState(() => new CityModel())
  return (
    <>
   {/* <FlatWorld
        position={new Vector3()}
        size={10_000}
        minCellSize={32}
        minCellResolution={32 * 2}
        lodOrigin={camera.position}
        worker={worker}
        data={{
          seed: "Flat Worlds Example",
        }}
      >
        <meshStandardMaterial vertexColors side={2} />
      </FlatWorld> */}
        {city && <RenderVoronoi voronoi={city.voronoi}/>}

    </>
  )
}

function RenderVoronoi ({ voronoi }: { voronoi: Voronoi }) {
  return  <group 
  rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
>
  {voronoi.points.map((point, i) => {
    return (<mesh>
      <sphereBufferGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={ new Color(Math.random() * 0xffffff)} />
    </mesh>)
    })}
    <OrbitControls />
    <Html>
      <div style={{ width: "100vw", height: "100vh" }}>

      <svg style={{ width: "100vw", height: "100vh" }}>
		    <polygon points="250,60 100,400 400,400" className="triangle" />
		    Sorry, your browser does not support inline SVG.
	  </svg>
    </div>
    </Html> 
  </group>
}
