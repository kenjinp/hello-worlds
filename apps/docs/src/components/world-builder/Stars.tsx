import * as React from 'react';
import { Mesh } from 'three';
import { SUN_RADIUS } from './WorldBuilder.math';
import { ECS, Star } from './WorldBuilder.state';

export const StarRender = React.forwardRef<Mesh, Star>(({
  position,
  radius = SUN_RADIUS,
  color,
  emissive,
  lightIntensity
}, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <directionalLight color={emissive} intensity={lightIntensity} castShadow />
      <sphereGeometry args={[radius, 32, 16]}></sphereGeometry>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={40.0}
      />
    </mesh>
  );
});

export const Stars: React.FC = () => {
  return (
    <ECS.ManagedEntities tag="star">
      {(entity) => {
        return (
          <ECS.Component name="mesh">
            <StarRender {...entity} />
          </ECS.Component>
        )
      }}
    </ECS.ManagedEntities>
  )
}