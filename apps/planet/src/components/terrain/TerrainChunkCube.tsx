import { Text } from "@react-three/drei";
import * as React from "react";
import {
  BufferAttribute,
  Color,
  Euler,
  Float32BufferAttribute,
  FrontSide,
  Mesh,
  PlaneGeometry,
  Vector3,
} from "three";
import { Generator3 } from "../generators/Generator3";

export interface TerrainChunkCubeProps {
  name: string;
  width: number;
  scale: number;
  radius: number;
  subdivisions: number;
  resolution: number;
  offset: Vector3;
  heightGenerators: Generator3<[number, number]>[];
  colourGenerator: Generator3<Color>;
  wireframe: boolean;
  visible: boolean;
}

export const TerrainChunkCube: React.FC<
  React.PropsWithChildren<TerrainChunkCubeProps>
> = ({
  name,
  width,
  scale,
  subdivisions,
  children,
  offset,
  heightGenerators,
  colourGenerator,
  radius,
  resolution,
  wireframe,
  visible,
}) => {
  const planeRef = React.useRef<PlaneGeometry>(null);
  const meshRef = React.useRef<Mesh>(null);
  const size = new Vector3(width * scale, 0, width * scale);
  const [hovered, setHover] = React.useState(false);

  const generateHeight = (v: Vector3) => {
    // TODO, lerp between height generators based on multiplier
    return heightGenerators[0].get(v.x, v.y, v.z)[0];
  };

  React.useEffect(() => {
    if (!planeRef.current || !meshRef.current) {
      return;
    }

    const plane = planeRef.current;
    const _D = new Vector3();
    const _D1 = new Vector3();
    const _D2 = new Vector3();
    const _P = new Vector3();
    const _H = new Vector3();
    const _W = new Vector3();
    const _C = new Vector3();
    const _S = new Vector3();

    const _N = new Vector3();
    const _N1 = new Vector3();
    const _N2 = new Vector3();
    const _N3 = new Vector3();

    const positions = [];
    const colors = [];
    const normals = [];
    const tangents = [];
    const uvs = [];
    const indices = [];

    const localToWorld = meshRef.current.parent?.matrix;
    if (!localToWorld) {
      console.warn("no localToWorld");
      return;
    }

    const half = width / 2;

    for (let x = 0; x < resolution + 1; x++) {
      const xp = (width * x) / resolution;
      for (let y = 0; y < resolution + 1; y++) {
        const yp = (width * y) / resolution;

        // Compute position
        _P.set(xp - half, yp - half, radius);
        _P.add(offset);
        _P.normalize();
        _D.copy(_P);
        _P.multiplyScalar(radius);
        _P.z -= radius;

        // Compute a world space position to sample noise
        _W.copy(_P);
        _W.applyMatrix4(localToWorld);

        const height = generateHeight(_W);
        const color = colourGenerator.get(_W.x, _W.y, height);

        // Purturb height along z-vector
        _H.copy(_D);
        _H.multiplyScalar(height);
        _P.add(_H);

        positions.push(_P.x, _P.y, _P.z);
        colors.push(color.r, color.g, color.b);
        normals.push(_D.x, _D.y, _D.z);
        tangents.push(1, 0, 0, 1);
        uvs.push(_P.x / 10, _P.y / 10);
      }
    }

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        indices.push(
          i * (resolution + 1) + j,
          (i + 1) * (resolution + 1) + j + 1,
          i * (resolution + 1) + j + 1
        );
        indices.push(
          (i + 1) * (resolution + 1) + j,
          (i + 1) * (resolution + 1) + j + 1,
          i * (resolution + 1) + j
        );
      }
    }

    for (let i = 0, n = indices.length; i < n; i += 3) {
      const i1 = indices[i] * 3;
      const i2 = indices[i + 1] * 3;
      const i3 = indices[i + 2] * 3;

      _N1.fromArray(positions, i1);
      _N2.fromArray(positions, i2);
      _N3.fromArray(positions, i3);

      _D1.subVectors(_N3, _N2);
      _D2.subVectors(_N1, _N2);
      _D1.cross(_D2);

      normals[i1] += _D1.x;
      normals[i2] += _D1.x;
      normals[i3] += _D1.x;

      normals[i1 + 1] += _D1.y;
      normals[i2 + 1] += _D1.y;
      normals[i3 + 1] += _D1.y;

      normals[i1 + 2] += _D1.z;
      normals[i2 + 2] += _D1.z;
      normals[i3 + 2] += _D1.z;
    }

    for (let i = 0, n = normals.length; i < n; i += 3) {
      _N.fromArray(normals, i);
      _N.normalize();
      normals[i] = _N.x;
      normals[i + 1] = _N.y;
      normals[i + 2] = _N.z;
    }

    plane.setAttribute("position", new Float32BufferAttribute(positions, 3));
    plane.setAttribute("color", new Float32BufferAttribute(colors, 3));
    plane.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    plane.setAttribute("tangent", new Float32BufferAttribute(tangents, 4));
    plane.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    plane.setIndex(new BufferAttribute(new Uint32Array(indices), 1));
  }, [
    planeRef,
    meshRef,
    width,
    scale,
    subdivisions,
    offset,
    heightGenerators,
    colourGenerator,
  ]);

  return (
    <mesh
      ref={meshRef}
      position={offset}
      visible={visible}
      castShadow={false}
      receiveShadow={true}
      onPointerOver={(e) => {
        setHover(true);
      }}
      onPointerOut={(e) => setHover(false)}
    >
      <Text
        position={new Vector3(0, 0, 50)}
        rotation={new Euler(Math.PI / 2, 0, 0)}
        scale={hovered ? 200 : 100}
        color={hovered ? "pink" : "white"}
      >
        {name}
      </Text>
      <bufferGeometry ref={planeRef} />
      <meshStandardMaterial
        wireframe={wireframe}
        side={FrontSide}
        vertexColors
        // color={new Color("purple")}
      />
      {children}
    </mesh>
  );
};
