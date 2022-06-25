import { FlyControls } from "@react-three/drei";
import { useControls } from "leva";
import * as React from "react";
// import { useControls as useInputControls} from "../../hooks/useControls";
const FlyCamera: React.FC = () => {
  const { movementSpeed } = useControls("movement", {
    movementSpeed: 100_000,
  });

  // const controls = useInputControls();
  // useFrame(() => {
  //   setMovementSpeed(movementSpeed + controls.mouse.wheel().query());
  // });

  return <FlyControls movementSpeed={movementSpeed} rollSpeed={0.25} />;
};

export default FlyCamera;
