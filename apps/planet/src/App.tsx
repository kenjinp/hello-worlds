import { Leva } from "leva";
import "./App.css";
import BasicScene from "./components/BasicScene";
import Planet from "./components/planet/Planet";

function App() {
  return (
    <div className="App">
      <Leva collapsed />
      <BasicScene>
        <Planet />
      </BasicScene>
    </div>
  );
}

export default App;
