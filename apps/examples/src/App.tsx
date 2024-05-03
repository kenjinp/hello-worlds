import { useEffect, useState } from "react"
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"

import { Canvas } from "./components/Canvas"
import { ExampleWrapper } from "./components/ExampleWrapper"
import Basic from "./examples/basic/Basic"
import Grass from "./examples/grass/GrassExample"
import GrassTerrain from "./examples/grass/GrassTerrainExample"
import Heightmap from "./examples/heightmap/Heightmap"
import RingWorld from "./examples/ring-world/RingWorld"
import Scatter from "./examples/scatter/Scatter"
import Tectonics from "./examples/tectonics/Tectonics"

interface IRoute {
  name: string
  path: string
  component: React.ComponentType
}

const routes: IRoute[] = [
  {
    name: "Basic",
    path: "/",
    component: Basic,
  },
  {
    name: "Heightmap output",
    path: "/heightmap-output",
    component: Heightmap,
  },
  {
    name: "Grass",
    path: "/grass",
    component: Grass,
  },
  {
    name: "Grass w/ Terrain",
    path: "/grass-terrain",
    component: GrassTerrain,
  },
  {
    name: "Scatter",
    path: "/scatter",
    component: Scatter,
  },
  {
    name: "Tectonics",
    path: "/tectonics",
    component: Tectonics,
  },
  {
    name: "RingWorld",
    path: "/ring-world",
    component: RingWorld,
  },
]

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentPath, setCurrentPath] = useState(location.pathname)

  useEffect(() => {
    const name = routes.find(route => route.path === currentPath)?.name
    document.title = `Hello Worlds Examples${name ? " - " + name : ""}`
    navigate(currentPath)
  }, [currentPath])

  return (
    <header>
      <a className="logo" href="https://github.com/kenjinp/hello-worlds">
        Hello Worlds
      </a>
      <select
        value={currentPath}
        onChange={event => setCurrentPath(event.target.value)}
      >
        {routes.map(route => (
          <option value={route.path} key={route.path}>
            {route.name}
          </option>
        ))}
      </select>
    </header>
  )
}

export default () => (
  <BrowserRouter>
    <Header />
    <Routes>
      {routes.map(route => (
        <Route
          path={route.path}
          key={route.path}
          element={
            <Canvas>
              <ExampleWrapper>
                <route.component />
              </ExampleWrapper>
            </Canvas>
          }
        />
      ))}
    </Routes>
  </BrowserRouter>
)
