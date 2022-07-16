import { Planet as HelloPlanet, PlanetProps as HelloPlanetProps } from "@hello-worlds/planets";
import { useFrame } from "@react-three/fiber";
import * as React from "react";
import { Vector3 } from "three";

const PlanetContext = React.createContext<HelloPlanet | null>(null);

export const usePlanet = () => {
  return React.useContext(PlanetContext);
};

export type PlanetProps<T> = React.PropsWithChildren<{
  planetProps: HelloPlanetProps;
  data: T;
  origin: Vector3;
  worker: new () => Worker;
}>

function PlanetInner<T>(
  props: PlanetProps<T>,
  ref: React.ForwardedRef<HelloPlanet<T>>
) {
  const { children, origin, worker, data, planetProps } = props
  const planetGroupRef = React.useRef<THREE.Group>(null);
  const [planetEngine] = React.useState<HelloPlanet>(new HelloPlanet(worker));


  React.useImperativeHandle(ref, () => planetEngine);

  React.useEffect(() => {
    planetEngine.planetProps = {
        ...planetEngine.planetProps,
        ...planetProps,
      };
      // TODO: this needs to be throttled somehow?
      // otherwise the thread queue gets too long and gets crazy memory issues
    planetEngine.rebuild(data);
  }, [planetProps, data]);

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
      planetEngine.update(origin, data);
    }
  });

  return (
    <>
      <PlanetContext.Provider value={planetEngine}>
        <group ref={planetGroupRef}>{children}</group>
      </PlanetContext.Provider>
    </>
  );
}

export const Planet = React.forwardRef(PlanetInner) as <T>(
  props: PlanetProps<T> & { ref?: React.ForwardedRef<HelloPlanet<T>> }
) => ReturnType<typeof PlanetInner<T>>;