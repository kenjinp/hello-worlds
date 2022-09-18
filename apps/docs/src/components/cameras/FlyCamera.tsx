import { FlyControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import { Group, MathUtils, Vector3 } from "three";
import { FlyControls as FlyControlsImpl } from "three-stdlib";
import { ECS, Planet } from "../world-builder/WorldBuilder.state";

const FlyCamera: React.FC<{
  minSpeed?: number,
  maxSpeed?: number
}> = ({
  minSpeed = 100,
  maxSpeed = 100_000_000
}) => {
  const flyControls = React.useRef<FlyControlsImpl>(null);
  const groupRef = React.useRef<Group>(null);
  const altitude = React.useRef(0);
  const { entities } = ECS.useArchetype("planet");
  const { camera } = useThree();
  const _closestPlanet = React.useRef<Planet>(null);

  React.useEffect(() => {
    const closestPlanet = entities.sort((a, b) => {
      return camera.position.distanceToSquared(a.position) - camera.position.distanceToSquared(b.position);
    })[0];
    camera.position.copy(
      new Vector3(
        closestPlanet.radius * 1.5,
        0,
        closestPlanet.radius * 1.5
      )
    );
    camera.lookAt(closestPlanet.position);
    console.log({closestPlanet, entities})
  }, [entities]);


  useFrame((_, deltaTime) => {
    const closestPlanet = _closestPlanet.current;
    _closestPlanet.current = entities.sort((a, b) => {
      return camera.position.distanceToSquared(a.position) - camera.position.distanceToSquared(b.position);
    })[0];
    if (!closestPlanet) { return ;}

    altitude.current =
      camera.position.distanceTo(closestPlanet.position) -
      closestPlanet.radius || 0;
        
    flyControls.current.movementSpeed = MathUtils.clamp(altitude.current, minSpeed, maxSpeed);
    const distance = groupRef.current.position.distanceTo(camera.position);
    groupRef.current.position.copy(camera.position);
    groupRef.current.quaternion.copy(camera.quaternion);

    const altitudeText = () => {
      const alt = altitude.current;
      if (alt < 10_000) {
        return alt.toLocaleString(navigator.language, { maximumFractionDigits: 2 }) + " meters"
      }
      return (alt / 1000).toLocaleString(navigator.language, { maximumFractionDigits: 2 }) + " km" 
    }

    const velocityText = () => {
      const v = distance / deltaTime
      if (v < 10_000) {
        return v.toLocaleString(navigator.language, { maximumFractionDigits: 2 }) + " m/s"
      }
      return (v / 1000).toLocaleString(navigator.language, { maximumFractionDigits: 2 }) + " km/s" 
    }

    document.getElementById('alt').innerHTML = 'Altitude: ' + altitudeText() + ' (Datum)';
    document.getElementById('speed').innerHTML = 'Velocity: ' + velocityText();
    document.getElementById('body').innerHTML = 'Body: <b>' + closestPlanet.name + '</b>';
  });
  

  return <>
    <FlyControls ref={flyControls} rollSpeed={0.25} />
    <group ref={groupRef}>
      <group position={new Vector3(0, 0, -10)}>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.75, 1]}  />
          <meshStandardMaterial color="pink" />
        </mesh>
      </group>
    </group>
  </>;
};

export default FlyCamera;
