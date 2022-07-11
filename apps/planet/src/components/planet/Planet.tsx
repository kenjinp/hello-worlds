import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { PlanetProps } from "../../lib";
import Language from "../../lib/language/Language";
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
  const { camera } = useThree();
  const planetGroupRef = React.useRef<THREE.Group>(null);
  const [planetEngine] = React.useState<PlanetEngine>(
    new PlanetEngine({
      numWorkers,
    })
  );

  // const geology = React.useMemo(
  //   () => new Geology({ radius: planetProps.radius || 4_000 }),
  //   [planetProps]
  // );

  React.useImperativeHandle(ref, () => planetEngine);

  React.useEffect(() => {
    planetEngine.planetProps = {
      ...planetEngine.planetProps,
      ...planetProps,
    };
    // TODO: this needs to be throttled somehow?
    planetEngine.rebuild();
    planetProps.radius &&
      camera.position.copy(
        new Vector3(planetProps.radius * 1.5, 0, planetProps.radius * 1.5)
      );
  }, [planetProps]);

  React.useLayoutEffect(() => {
    if (planetGroupRef.current) {
      planetGroupRef.current.add(planetEngine.rootGroup);
      // planetGroupRef.current.add(geology.mesh);
    }
    window.conLang = new Language();
    console.log("new conlang!");
    console.log(window.conLang.makeName("language"));
    console.log(window.conLang.makeName("town"));
    console.log(window.conLang.makeName("city"));
    console.log(window.conLang.makeName("village"));
    return () => {
      if (planetGroupRef.current) {
        planetGroupRef.current.remove(planetEngine.rootGroup);
        // planetGroupRef.current.remove(geology.mesh);
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
      <PlanetContext.Provider value={planetEngine}>
        <group ref={planetGroupRef}>{children}</group>
      </PlanetContext.Provider>
    </>
  );
});

export default Planet;
