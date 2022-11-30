import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as React from "react";
import {
  Color,
  InstancedMesh,
  Object3D,
  Sphere,
  Vector3
} from "three";
import { randomBias, randomSpherePoint } from "../../moon/Moon.math";
import { cartesianToPolar } from "../voronoi/math";
import { PolarSpatialHashGrid } from "./PolarSpatialHash";

const o = new Object3D();
const oVector = new Vector3();
const color = new Color();
const PolarHashTest: React.FC = () => {
  // create a bunch of random points
  // place them on a sphere
  // get intersection point
  // find hashed points by their radius and intersection point;
  // change their color or something
  const meshRef = React.useRef<InstancedMesh>(null);
  const [target] = React.useState(new Vector3());
  const hashGrid = React.useRef<PolarSpatialHashGrid<{ index: number }> | null>(
    null
  );
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);

  const sphere = useControls("sphere", {
    radius: {
      min: 100,
      max: 6_000_000,
      value: 5_000 * 4,
      step: 10,
    },
    testPoints: {
      min: 1,
      max: 10_000,
      value: 20,
      step: 1,
    },
  });

  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const psh = new PolarSpatialHashGrid<{ index: number }>(
      sphere.radius,
      [100, 100]
    );
    Array(sphere.testPoints)
      .fill(0)
      .forEach((val, index) => {
        const radius = randomBias(10, sphere.radius / 1000, 15, 0.9);
        const [x, y, z] = randomSpherePoint(0, 0, 0, sphere.radius);
        o.position.set(x, y, z);
        o.scale.set(1, 1, 1).multiplyScalar(radius);
        o.updateMatrixWorld();
        psh.addItem(cartesianToPolar(o.position), radius, { index });
        mesh.setMatrixAt(index, o.matrixWorld);
      });

    // psh.cells.forEach(({ min, max }) => {
    //   console.log({min, max}, polarToCartesian(min[1], max[0], psh.radius))
    //   const bb = new Box3(
    //     polarToCartesian(min[1], min[0], psh.radius), 
    //     polarToCartesian(max[1], max[0], psh.radius)
    //   );
    //   const helper = new Box3Helper(bb);
    //   mesh.add(helper);
    // })
    // psh.cells.
    hashGrid.current = psh;
    mesh.count = sphere.testPoints;
    mesh.instanceMatrix.needsUpdate = true;
  }, [meshRef.current, sphere]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    for (let i = 0; i < sphere.testPoints; i ++) {
        mesh.setColorAt(i, color.setColorName(selectedIndices.includes(i) ? "tomato" : "aqua"))
    }
    mesh.instanceColor!.needsUpdate = true;
  })

  const handlePointer = (e: ThreeEvent<MouseEvent>) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const psh = hashGrid.current;
    if (!psh) {
      return;
    }
    const s = new Sphere(oVector, sphere.radius);
    e.ray.intersectSphere(s, target);
    // where on the sphere we land with our pointer
    const intersection = target.clone();
    const containedCell = psh.nearbyItems(cartesianToPolar(intersection));
    console.log(cartesianToPolar(intersection), containedCell);
    if (!containedCell) {
      return;
    }
    // const bb = new Box3();
    // const boundingSphere = new Sphere(intersection, 100);
    // boundingSphere.getBoundingBox(bb);
    // const helper = new Box3Helper(bb);
    // mesh.add(helper);
    // const indices = Array.from(containedCell?.set.entries()).map(([{ index }]) => index);
    setSelectedIndices(containedCell.set.map(({index}) => index))
  };

  return (
    <group>
      <mesh
        scale={new Vector3(sphere.radius, sphere.radius, sphere.radius)}
        onClick={handlePointer}
      >
        <icosahedronGeometry args={[1, 15]} />
        <meshBasicMaterial vertexColors visible={false} />
      </mesh>
      <instancedMesh ref={meshRef} args={[, , 10_000]}>
        <sphereBufferGeometry args={[100, 32, 32]} />
        <meshStandardMaterial color="aqua" />
      </instancedMesh>
    </group>
  );
};

export default PolarHashTest;
