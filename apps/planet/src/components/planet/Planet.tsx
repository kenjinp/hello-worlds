import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { PlanetProps } from "../../lib";
import PlanetEngine, { PlanetEngineProps } from "../../lib/planet/PlanetEngine";

const Planet = React.forwardRef<
  PlanetEngine,
  React.PropsWithChildren<
    PlanetProps & PlanetEngineProps & { anchorPoint: THREE.Vector3 }
  >
>(({ children, numWorkers, anchorPoint, ...planetProps }, ref) => {
  const [planetEngine] = React.useState(
    new PlanetEngine({
      numWorkers,
    })
  );

  React.useImperativeHandle(ref, () => planetEngine);

  const { scene } = useThree();

  React.useEffect(() => {
    planetEngine.planetProps = planetProps;
    planetEngine.rebuild();
  }, [planetProps]);

  React.useLayoutEffect(() => {
    scene.add(planetEngine.rootGroup);
    return () => void scene.remove(planetEngine.rootGroup);
  }, [scene]);

  useFrame(() => {
    if (planetEngine.planetProps) {
      planetEngine.update(anchorPoint);
    }
  });

  return null;
});

export default Planet;
