import { Planet as HelloPlanet, PlanetProps } from "@hello-worlds/planets";
import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import { Vector3 } from "three";

const PlanetContext = React.createContext<HelloPlanet | null>(null);

export const usePlanet = () => {
  return React.useContext(PlanetContext);
};

export const Planet = React.forwardRef<
  HelloPlanet,
  React.PropsWithChildren<
    Partial<PlanetProps> & { origin: Vector3; worker: new () => Worker }
  >
>(({ children, origin, worker, ...planetProps }, ref) => {
  const { camera } = useThree();
  const planetGroupRef = React.useRef<THREE.Group>(null);
  const [planetEngine] = React.useState<HelloPlanet>(new HelloPlanet(worker));

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
    }
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
      <PlanetContext.Provider value={planetEngine}>
        <group ref={planetGroupRef}>{children}</group>
      </PlanetContext.Provider>
    </>
  );
});

export default Planet;
