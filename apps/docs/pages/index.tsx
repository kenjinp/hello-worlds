import BasicScene from "@components/BasicScene"
import ExampleLayout from "@components/layouts/example/Example"
import { useRouter } from "next/router"
import * as React from "react"

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
    <ExampleLayout>
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
    </ExampleLayout>
  )
}

export default AtmosphereExperiment
