import { Leva } from "leva";
import "./App.css";
import BasicScene from "./components/BasicScene";
import { PlayerPhysicsSystem } from "./components/physics/Physics";
import Planet from "./components/planet/Planet";
import { PlayerSpawner } from "./components/player/PlayerSpawner";
import { useStore } from "./store";

function App() {
  const state = useStore();

  return (
    <div className="App">
      <Leva collapsed />
      <BasicScene>
        {state.playerSpawnPositions.map((pos) => {
          console.log("spawn position", pos);

          return <PlayerPhysicsSystem startingPosition={pos} />;
        })}
        <Planet />
        <PlayerSpawner />
      </BasicScene>
    </div>
  );
}

export default App;
