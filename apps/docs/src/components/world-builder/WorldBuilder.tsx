import Link from "@docusaurus/Link"
import { faBook, faGear } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Stars } from "@react-three/drei"
import { RoomProvider, useOthers } from "@site/src/services/multiplayer"
import * as React from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Vector3 } from "three"
import logo from "../../../../../logo.png"
import SolarSystem from "../../../static/img/solar-system.svg"
import { Button } from "../button/Button"
import Footer from "../footer/Footer"
import { HeaderStyled } from "../header/Header.style"
import { SpaceBox } from "../SpaceBox"
import { JumpTo } from "./JumpTo"
import { Menu } from "./Settings"
import { Options, ThemeSelector } from "./Theme"
import { Canvas } from "./WorldBuilder.canvas"
import { RenderEntities } from "./WorldBuilder.entities"
import { AU } from "./WorldBuilder.math"
import { PostProcessing } from "./WorldBuilder.postprocessing"

const Presence: React.FC = () => {
  const others = useOthers()

  return <span>{others.count + 1} explorers</span>
}

const HeaderThing: React.FC = () => {
  return (
    <HeaderStyled>
      <div>
        <Menu
          style={{
            alignItems: "flex-start",
          }}
          icon={<SolarSystem style={{ fill: "white", width: "2.5em" }} />}
        >
          <JumpTo />
        </Menu>
      </div>
      <div></div>
      <div>
        <Menu
          style={{
            alignItems: "flex-end",
          }}
          icon={<FontAwesomeIcon icon={faGear} />}
        >
          <ThemeSelector />
          <Options />
        </Menu>
      </div>
    </HeaderStyled>
  )
}

export default function (): React.ReactElement {
  // because React needs to be defined :[
  React.useLayoutEffect(() => {
    toast(
      <div
        style={{
          fontFamily: "OsakaMono",
        }}
      >
        <h2>
          <img src={logo} alt="hello worlds" />
        </h2>
        <h3>Demo Planetarium</h3>
        <p>
          navigate with keys <b>WASD-QE</b> + <b>mouse1/mouse2</b>
        </p>
        <small>click to dismiss this and other messages</small>
      </div>,
      {
        autoClose: false,
      },
    )
  }, [])

  return (
    <RoomProvider id="planetarium">
      <div style={{ color: "#f4f4f4" }}>
        <ToastContainer
          style={{
            position: "fixed",
            zIndex: 9999,
            // visibility: "hidden",
          }}
          position="top-center"
          autoClose={3000}
          theme={"colored"}
        />
        <HeaderThing />

        <Canvas>
          <PostProcessing>
            <SpaceBox />
            <group
              scale={new Vector3(1, 1, 1).multiplyScalar(AU).multiplyScalar(10)}
            >
              <Stars saturation={1} />
            </group>
            <RenderEntities />
          </PostProcessing>
        </Canvas>
        <Footer
          middle={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "30vw",
              }}
            >
              <div id="body"></div>
              <div id="alt"></div>
              <div id="speed"></div>
            </div>
          }
        >
          <Link to="/docs/intro">
            <Button>
              <FontAwesomeIcon icon={faBook} /> Docs
            </Button>
          </Link>{" "}
          <Presence />
        </Footer>
      </div>
    </RoomProvider>
  )
}
