import { OrbitControls } from "@react-three/drei";
import { Leva } from "leva";
import * as React from "react";
import "./App.css";
import BasicScene from "./components/BasicScene";
import CameraButtons from "./components/cameras/CameraButtons";
import { PlayerPhysicsSystem } from "./components/physics/Physics";
import Planet from "./components/planet/Planet";
import { PlayerSpawner } from "./components/player/PlayerSpawner";
import { useStore } from "./store";
import Worker from "./Worker?worker";
const w = new Worker();

function App() {
  const state = useStore();

  React.useEffect(() => {
    w.postMessage({ subject: "ping", data: [1, 2, 3] });
    const messageHandler = (m: any) => console.log(m);
    w.addEventListener("message", messageHandler);
    return () => {
      w.removeEventListener("message", messageHandler);
    };
  }, []);

  return (
    <div className="App">
      <Leva collapsed />
      <BasicScene>
        {state.playerSpawnPositions.map((pos, index) => {
          console.log("spawn position", pos);

          return <PlayerPhysicsSystem key={index} startingPosition={pos} />;
        })}
        <Planet />
        <OrbitControls />
        <PlayerSpawner />
      </BasicScene>
      <div
        id="actions"
        style={{ position: "absolute", left: "1em", bottom: "1em" }}
      >
        <button>Spawn Player</button>
        <CameraButtons />
        <div id="spawner"></div>
      </div>
    </div>
  );
}

export default App;
