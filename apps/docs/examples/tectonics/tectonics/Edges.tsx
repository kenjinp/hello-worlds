import * as React from "react";
import {
  Color,
  InstancedMesh,
  LineBasicMaterial,
  Object3D,
  Vector3,
} from "three";
import { calculateRelativeMotionOnVertex, calculateStressOnEdge } from "./Edge";
import { useTectonics } from "./TectonicsComponent";
import { vectorTo } from "./utils";

const material = new LineBasicMaterial({ color: 0x0000ff });

export const EdgeLines: React.FC = () => {
  const tectonics = useTectonics();
  const edges = Array.from(tectonics.edges.values());

  return (
    <group>
      {edges.map((edge, i) => {
        if (!edge) return void console.warn("plate not found", i);

        return (
          <line key={`edge-${i}`}>
            <primitive attach="material" object={material} />
            <bufferGeometry>
              <float32BufferAttribute
                attach={(parent, self) => (
                  parent.setAttribute("position", self),
                  () => parent.deleteAttribute("position")
                )}
                args={[
                  edge.coordinates.reduce(
                    (memo, { x, y, z }) => [...memo, x, y, z],
                    [] as number[]
                  ),
                  3,
                ]}
              />
            </bufferGeometry>
          </line>
        );
      })}
    </group>
  );
};

const origin = new Vector3();
export const EdgePoints: React.FC = () => {
  const tectonics = useTectonics();
  const instancesRef = React.useRef<InstancedMesh>(null!);
  const [o] = React.useState(() => new Object3D());

  function updateInstances() {
    if (!instancesRef.current) return;

    let n = 0;
    const edges = Array.from(tectonics.edges.values());
    const tectonicTypeColorMap = {
      oceanCollision: new Color(0x34ebde), // blue
      subduction: new Color(0xeb6234), // orange
      superduction: new Color(0xf0f02b), // yelow
      diverging: new Color(0xd92bf0), // purple
      shearing: new Color(0x2bf03f), // green
      dormant: new Color(0x2b49f0), // blue
    };
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      const edgeColor = new Color(Math.random() * 0xffffff);
      for (let j = 0; j < edge.coordinates.length; j++) {
        n++;

        const { coordinate, region, neighborRegion } = edge.coordinates[j];

        const movementPlate0 = region.plate.calculateMovement(coordinate);
        const movementPlate1 =
          neighborRegion.plate.calculateMovement(coordinate);
        const boundaryNormal = vectorTo(
          region.region.properties.siteXYZ,
          neighborRegion.region.properties.siteXYZ
        );
        const boundaryVector = boundaryNormal.cross(coordinate);

        const relativeMotion = calculateRelativeMotionOnVertex(
          movementPlate0,
          movementPlate1
        ).normalize();

        const { pressure, shear } = calculateStressOnEdge(
          movementPlate0,
          movementPlate1,
          boundaryVector,
          boundaryNormal
        );

        let elevation = region.plate.elevation;
        let tectonicBoundaryType = new Color();

        if (pressure > 0.3) {
          elevation =
            Math.max(region.plate.elevation, neighborRegion.plate.elevation) +
            pressure;
          if (region.plate.oceanic && neighborRegion.plate.oceanic) {
            // calculateElevation = calculateCollidingElevation;
            // oceanCollision
            tectonicBoundaryType.copy(tectonicTypeColorMap.oceanCollision);
          } else if (region.plate.oceanic) {
            // subduction
            tectonicBoundaryType.copy(tectonicTypeColorMap.subduction);
          } else {
            // superduction
            tectonicBoundaryType.copy(tectonicTypeColorMap.superduction);
          }
        } else if (pressure < -0.3) {
          elevation =
            Math.max(region.plate.elevation, neighborRegion.plate.elevation) -
            pressure / 4;
          // calculateElevation = calculateDivergingElevation;
          // diverging elevation
          tectonicBoundaryType.copy(tectonicTypeColorMap.diverging);
        } else if (shear > 0.3) {
          elevation =
            Math.max(region.plate.elevation, neighborRegion.plate.elevation) +
            shear / 8;
          // calculateElevation = calculateShearingElevation;
          // shearing elevation
          tectonicBoundaryType.copy(tectonicTypeColorMap.shearing);
        } else {
          elevation =
            (region.plate.elevation + neighborRegion.plate.elevation) / 2;
          // calculateElevation = calculateDormantElevation;
          // Dormant Elevation
          tectonicBoundaryType.copy(tectonicTypeColorMap.dormant);
        }

        o.position.copy(coordinate);

        o.lookAt(origin);
        o.rotateX((90 * Math.PI) / 180);

        // const relativeMotionColor = color.setRGB(
        //   relativeMotion.x,
        //   relativeMotion.y,
        //   relativeMotion.z
        // );

        o.updateMatrixWorld();
        instancesRef.current.setMatrixAt(n, o.matrixWorld);
        instancesRef.current.setColorAt(
          n,
          // color.setRGB(relativeMotion.x, relativeMotion.y, relativeMotion.z)
          tectonicBoundaryType
        );
      }
    }

    instancesRef.current.count = n;
    instancesRef.current.instanceMatrix.needsUpdate = true;
    instancesRef.current.instanceColor!.needsUpdate = true;
  }

  React.useEffect(updateInstances, [tectonics?.edges]);

  return (
    <group>
      {/* {Labels} */}
      {/* <EdgeLines /> */}
      <instancedMesh ref={instancesRef} args={[, , 100_000]}>
        <sphereBufferGeometry args={[100, 32, 32]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
};
