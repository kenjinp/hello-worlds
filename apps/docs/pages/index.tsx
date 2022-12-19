import Link from "next/link"
import { useRouter } from "next/router"
import * as React from "react"
import BasicScene from "../components/BasicScene"

//   queue(() => {
//     console.log("show map?")
//     const systemMap = world
//       .with("window")
//       .entities.find(e => e.id === "system map")
//     if (!systemMap) return
//     let func
//     if (systemMap.minimized) {
//       func = () => world.removeComponent(systemMap, "minimized")
//     } else {
//       func = () => world.addComponent(systemMap, "minimized", true)
//     }
//     func()
//   })
// }

// const listener = (e: KeyboardEvent) => {
//   if (e.key === "t") {
//     console.log("key press")
//     showMap()
//   }
// }
// world.add({
//   id: "system map",
//   minimized: true,
//   window: true,
//   header: "System Map ( m)",
//   // content: <SystemExplorer />,
// })
// document.addEventListener("keyup", listener)

// const loop = () => {
//   queue.flush()
//   requestAnimationFrame(loop)
// }

// loop()

const AtmosphereExperiment: React.FC = props => {
  console.log({ props })
  const router = useRouter()

  // const [atmo] = React.useState(() => new AtmosphereGenerator())
  // const atmoRef = React.useRef<AtmosphereGenerator>(new AtmosphereGenerator())

  return (
    <div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 100,
          padding: "1em",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* <RenderMinimizedWindows />
        <Button onClick={() => atmo.randomizeSuns()}>Randomize Suns</Button> */}
      </div>
      <BasicScene>
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>

        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>

        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="green" />
        </mesh>
      </BasicScene>
      <div
        id="window-bounds"
        style={{
          zIndex: 101,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          // pointerEvents: "none",
          overflow: "hidden",
          color: "white",
        }}
      >
        <button
          onClick={() => {
            router.push("?atmosphere=" + Math.random())
          }}
        >
          Click meee
        </button>
        <h1>{router.query.atmosphere}</h1>
        <Link href="/about">About Us</Link>
        <h1>Bananas</h1>
        <h1>Bananas</h1>
        <h1>Bananas</h1>
        <h1>Bananas</h1>
        {/* <SystemMap />
        <RenderWindows /> */}
      </div>
    </div>
  )
}

export default AtmosphereExperiment
