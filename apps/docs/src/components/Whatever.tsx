import BasicScene from "./BasicScene";
import { PlanetGenerator } from "./planet/PlanetGenerator";

import Link from "@docusaurus/Link";
import { faBook, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setRandomSeed } from "@hello-worlds/core";
import { Leva } from "leva";
import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import ReactTooltip from "react-tooltip";
import logo from "../../../../logo.png";
import { Button } from "./button/Button";
import { Container } from "./container/Container";
import CultureGenerator from "./cultures/CultureGenerator";
import Demographics from "./demographics/Demographics";
import Footer from "./footer/Footer";
import States from "./states/States";

setRandomSeed("banana");

const Interface = () => {
  const [exploreWindow, setExploreWindow] = React.useState(false);
  const [sayHello, setSayHello] = React.useState(true);

  return (
    <>
      {sayHello && (
        <Container
          style={{
            zIndex: 2,
            maxWidth: "50vw",
            position: "absolute",
          }}
          // center
          header="Hello World!"
          onClose={() => setSayHello(false)}
        >
          <h1>
            <img src={logo} alt="hello worlds" />
          </h1>
          <h2>Worldbuilding for the web!</h2>
          <p>
            Before you sits a planet with the same dimensions as <b>Earth</b>!
          </p>
          <p>Right now you can zoom around it, and its details will fill in.</p>
          <p>
            There are no structures or anything yet, but if you <b>Explore</b>,
            you can find some procedurally generated civilizations which should
            populate this lonely sphere *soon*!
          </p>
          <p>
            The goal of this project is to provide a suite of tools, libraries,
            and examples to help with{" "}
            <b>
              <i>Virtual Worldbuilding</i>
            </b>{" "}
            on the web!
          </p>
          <div>
            <button onClick={() => setSayHello(false)}>Ok!</button>{" "}
            <a href="https://github.com/kenjinp/worlds">
              <button>Github</button>
            </a>
          </div>
        </Container>
      )}
      {exploreWindow && (
        <Container
          header="Explore"
          style={{
            zIndex: 2,
            maxWidth: "100vw",
            position: "absolute",
          }}
          onClose={() => setExploreWindow(false)}
        >
          <Tabs defaultIndex={2}>
            <TabList>
              <Tab>Planet</Tab>
              <Tab>Cultures</Tab>
              <Tab>States</Tab>
              <Tab>Demographics</Tab>
              <Tab>Languages</Tab>
              <Tab>Debug</Tab>
            </TabList>
            <TabPanel>
              <h2>Planet</h2>
              <p>todo: add configurations here</p>
            </TabPanel>
            <TabPanel>
              <h2>Cultures</h2>
              <p>todo: create cultural tree here</p>
            </TabPanel>
            <TabPanel>
              <h2>States</h2>
              <p>From most prosperous to diminished</p>
              <States />
            </TabPanel>
            <TabPanel>
              <h2>Demographics</h2>
              <Demographics />
            </TabPanel>
            <TabPanel>
              <h2>Languages</h2>
              <p>todo: create language tree here</p>
            </TabPanel>
            <TabPanel>
              <h2>Debug</h2>
              <p>todo: Debug stuff goes here</p>
            </TabPanel>
          </Tabs>
        </Container>
      )}
      <ReactTooltip />
      <Footer
        middle={
          <div>
            <div id="altitude" />
            {/* <div id="scrollspeed"></div> */}
          </div>
        }
      >
        <>
          <Button onClick={() => setExploreWindow(!exploreWindow)}>
            <FontAwesomeIcon icon={faGlobe} /> Explore
          </Button>
          {" | "}
          <Link to="/docs/intro">
            <Button>
              <FontAwesomeIcon icon={faBook} /> Docs!
            </Button>
          </Link>
        </>
      </Footer>
    </>
  );
};

export function Whatever() {
  return (
    <div className="App">
      <div
        id="window-bounds"
        style={{
          height: "calc(100vh - 57px)",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      ></div>
      <Leva collapsed hidden />
      <CultureGenerator />
      <BasicScene>
        {/* {state.playerSpawnPositions.map((pos, index) => {
          console.log("spawn position", pos);
          return <PlayerPhysicsSystem key={index} startingPosition={pos} />;
        })} */}
        <PlanetGenerator />
        {/* <FloatingOriginScene><OrbitControls /></FloatingOriginScene> */}
        {/* <FlyControls /> */}
        {/* <PlayerSpawner /> */}
        {/* <RenderPlayers /> */}
        {/* <FlyCamera /> */}
      </BasicScene>
      <Interface />
    </div>
  );
}
