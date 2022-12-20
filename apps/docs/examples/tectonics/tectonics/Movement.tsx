import * as React from "react";
import { Color, Float32BufferAttribute, Mesh, Vector3 } from "three";
import { useTectonics } from "./TectonicsComponent";

function buildArrow(
  verts: number[],
  colors: number[],
  position: Vector3,
  direction: Vector3,
  normal: Vector3,
  baseWidth: number,
  color: Color
) {
  if (direction.lengthSq() === 0) return;
  const sideOffset = direction
    .clone()
    .cross(normal)
    .setLength(baseWidth / 2);
  const vec0 = position.clone().add(sideOffset);
  const vec1 = position.clone().add(direction);
  const vec2 = position.clone().sub(sideOffset);
  verts.push(
    vec0.x,
    vec0.y,
    vec0.z,
    vec1.x,
    vec1.y,
    vec1.z,
    vec2.x,
    vec2.y,
    vec2.z
  );
  colors.push(
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b
  );
}

// TODO will have to get this value from usePlanet();
const planetOrigin = new Vector3(0, 0, 0);
const tempVector3 = new Vector3();

export const PlateMovement: React.FC = () => {
  const tectonics = useTectonics();
  const meshRef = React.useRef<Mesh>(null);

  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const verts: number[] = [];
    const colors: number[] = [];

    for (let p = 0; p < tectonics.plates.size; p++) {
      const plate = tectonics.plates.get(p);
      if (!plate) {
        console.log("plate not found", p);
        continue;
      }
      const regions = Array.from(plate.regions.values());
      for (let r = 0; r < regions.length; r++) {
        const plateRegion = regions[r];
        if (!plateRegion) {
          console.log("region not found", r);
          continue;
        }
        const { region } = plateRegion;
        const movement = plate.calculateMovement(region.properties.siteXYZ);
        const normal = tempVector3
          .randomDirection()
          .clone()
          .subVectors(region.properties.siteXYZ, planetOrigin);
        const plateMovementColor = new Color(
          1 - plate.color.r,
          1 - plate.color.g,
          1 - plate.color.b
        );
        buildArrow(
          verts,
          colors,
          region.properties.siteXYZ,
          movement.divideScalar(2),
          normal,
          movement.length() / 4,
          plateMovementColor
        );
      }
    }

    meshRef.current.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(verts, 3)
    );
    meshRef.current.geometry.setAttribute(
      "color",
      new Float32BufferAttribute(colors, 3)
    );

    return () => {
      if (!mesh) {
        return;
      }
      mesh.children.forEach((child) => child.removeFromParent());
    };
  }, [tectonics, meshRef]);

  return (
    <mesh ref={meshRef}>
      <bufferGeometry />
      <meshBasicMaterial vertexColors />
    </mesh>
  );
};
