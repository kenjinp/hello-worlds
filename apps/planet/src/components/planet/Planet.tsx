import { useFrame } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { PlanetProps } from "../../lib";
import PlanetEngine, { PlanetEngineProps } from "../../lib/planet/PlanetEngine";

const Planet = React.forwardRef<
  PlanetEngine,
  React.PropsWithChildren<
    Partial<PlanetProps> & PlanetEngineProps & { origin: THREE.Vector3 }
  >
>(({ children, numWorkers, origin, ...planetProps }, ref) => {
  const planetGroupRef = React.useRef<THREE.Group>(null);
  const [planetEngine] = React.useState(
    new PlanetEngine({
      numWorkers,
    })
  );

  React.useImperativeHandle(ref, () => planetEngine);

  React.useEffect(() => {
    planetEngine.planetProps = {
      ...planetEngine.planetProps,
      ...planetProps,
    };
    planetEngine.rebuild();
  }, [planetProps]);

  React.useLayoutEffect(() => {
    planetGroupRef.current &&
      planetGroupRef.current.add(planetEngine.rootGroup);
    return () => {
      if (planetGroupRef.current) {
        planetGroupRef.current.remove(planetEngine.rootGroup);
      }
    };
  }, [planetGroupRef]);

  useFrame(() => {
    if (planetEngine.planetProps) {
      planetEngine.update(origin);
    }
  });

  return (
    <>
      {/* <mesh position={origin.clone().sub(new Vector3(0, 1000, 1000))}>
        <Html>
          <h1>Origin</h1>
        </Html>
        <mesh scale={new Vector3(100, 100, 100)}>
          <sphereGeometry></sphereGeometry>
          <meshBasicMaterial color="purple" />
        </mesh>
      </mesh> */}
      <group ref={planetGroupRef} />
    </>
  );
});

export default Planet;
