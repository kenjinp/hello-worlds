import { Planet as HelloPlanet } from '@hello-worlds/react';
import { useThree } from '@react-three/fiber';
import * as React from 'react';
import { Mesh } from 'three';
import FlyCamera from '../cameras/FlyCamera';
import { CERES_RADIUS } from './WorldBuilder.math';
import { ECS, Planet } from './WorldBuilder.state';
import worker from "./WorldBuilder.worker";

export const PlanetRender = React.forwardRef<Mesh, Planet>(({
  position,
  radius = CERES_RADIUS,
  seed,
  focused
}, ref) => {

  const { camera } = useThree();
  const planetProps = React.useMemo(
    () => ({
      radius: radius,
      minCellSize: 32 * 4,
      minCellResolution: 32 * 2,
      invert: false,
    }),
    [radius]
  );

  const initialData = React.useMemo(() => ({
    seed
  }), []);
  const chunkData = React.useMemo(() => ({}), [])

  return (
    <mesh ref={ref} position={position}>
      <HelloPlanet
        planetProps={planetProps}
        lodOrigin={camera.position}
        worker={worker}
        initialData={initialData}
        data={chunkData}
      >
        {focused && <FlyCamera />}
        <meshStandardMaterial vertexColors/>
      </HelloPlanet>
    </mesh>
  );
});

export const Planets: React.FC = () => {
  return (
    <ECS.ManagedEntities tag="planet">
      {(entity) => {
        return (
          <ECS.Component name="mesh">
            <PlanetRender {...entity} />
          </ECS.Component>
        )
      }}
    </ECS.ManagedEntities>
  )
}