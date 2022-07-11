import "./App.css";
import BasicScene from "./components/BasicScene";
import { PlanetGenerator } from "./components/planet/PlanetGenerator";

import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OrbitControls } from "@react-three/drei";
import { Leva } from "leva";
import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Button } from "./components/button/Button";
import { Container } from "./components/container/Container";
import CultureGenerator from "./components/cultures/CultureGenerator";
import Demographics from "./components/demographics/Demographics";
import Footer from "./components/footer/Footer";
import States from "./components/states/States";

function App() {
  const [exploreWindow, setExploreWindow] = React.useState(false);

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
      <Footer>
        <Button onClick={() => setExploreWindow(!exploreWindow)}>
          <FontAwesomeIcon icon={faGlobe} /> Explore
        </Button>
      </Footer>
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
        <OrbitControls />
      </BasicScene>
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
    </div>
  );
}

export default App;
