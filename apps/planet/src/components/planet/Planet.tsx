import { useFrame } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { PlanetProps } from "../../lib";
import Geology from "../../lib/geology/Geology";
import PlanetEngine, { PlanetEngineProps } from "../../lib/planet/PlanetEngine";

const PlanetContext = React.createContext<PlanetEngine | null>(null);

export const usePlanet = () => {
  return React.useContext(PlanetContext);
};

const Planet = React.forwardRef<
  PlanetEngine,
  React.PropsWithChildren<
    Partial<PlanetProps> & PlanetEngineProps & { origin: THREE.Vector3 }
  >
>(({ children, numWorkers, origin, ...planetProps }, ref) => {
  const planetGroupRef = React.useRef<THREE.Group>(null);
  const [planetEngine] = React.useState<PlanetEngine>(
    new PlanetEngine({
      numWorkers,
    })
  );

  const geology = React.useMemo(
    () => new Geology({ radius: planetProps.radius || 4_000 }),
    [planetProps]
  );

  React.useImperativeHandle(ref, () => planetEngine);

  React.useEffect(() => {
    planetEngine.planetProps = {
      ...planetEngine.planetProps,
      ...planetProps,
    };
    console.log("rebuild call");
    // TODO: this needs to be throttled somehow?
    planetEngine.rebuild;
  }, [planetProps]);

  React.useLayoutEffect(() => {
    if (planetGroupRef.current) {
      planetGroupRef.current.add(planetEngine.rootGroup);
      planetGroupRef.current.add(geology.mesh);
    }
    return () => {
      if (planetGroupRef.current) {
        planetGroupRef.current.remove(planetEngine.rootGroup);
        planetGroupRef.current.remove(geology.mesh);
      }
    };
  }, [planetGroupRef, geology]);

  useFrame(() => {
    if (planetEngine.planetProps) {
      planetEngine.update(origin);
    }
  });

  return (
    <>
      <PlanetContext.Provider value={planetEngine}>
        <group ref={planetGroupRef}>{children}</group>
      </PlanetContext.Provider>
    </>
  );
});

export default Planet;
