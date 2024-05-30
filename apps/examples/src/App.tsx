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
