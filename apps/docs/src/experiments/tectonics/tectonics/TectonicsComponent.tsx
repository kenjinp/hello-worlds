import { MeshProps } from "@react-three/fiber";
import * as React from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { VoronoiSphere } from "../voronoi/Voronoi";
import { Tectonics as TectonicsImplementation } from "./Tectonics";

const TectonicsContext = React.createContext<TectonicsImplementation>(
  null as unknown as TectonicsImplementation
);

export const useTectonics = () => {
  return React.useContext(TectonicsContext);
};

const borderColor = new Color(0xeb4034);

export const TectonicsComponent: React.FC<
  React.PropsWithChildren<
    {
      voronoiSphere: VoronoiSphere;
      numberOfPlates: number;
      showInternalBorders?: boolean;
    } & MeshProps
  >
> = ({
  voronoiSphere,
  numberOfPlates,
  children,
  showInternalBorders = false,
  ...props
}) => {
  const tectonics = React.useMemo(
    () => new TectonicsImplementation(voronoiSphere, numberOfPlates),
    [numberOfPlates]
  );

  const [mat] = React.useState(new MeshBasicMaterial({ vertexColors: true }));

  const meshRef = React.useRef<Mesh>(null);

  React.useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      tectonics.plates.forEach((plate) => {
        const geo = new BufferGeometry();
        const mesh = new Mesh(geo, mat);
        const regionColors: number[] = [];
        const regionVerts: number[] = [];

        plate.regions.forEach(({ region }) => {
          const featureColor = plate.color;
          regionVerts.push(...region.geometry.vertices);

          const isInternalBorder = plate.internalBorderRegions.has(
            region.properties.index
          );

          for (let c = 0; c < region.geometry.vertices.length; c += 3) {
            const color = showInternalBorders
              ? isInternalBorder
                ? borderColor
                : featureColor
              : featureColor;
            regionColors.push(color.r, color.g, color.b);
          }
        });

        geo.setAttribute(
          "position",
          new Float32BufferAttribute(regionVerts, 3)
        );
        geo.setAttribute("color", new Float32BufferAttribute(regionColors, 3));

        geo.computeVertexNormals();

        meshRef.current?.add(mesh);
      });
    }
    return () => {
      mesh?.traverse((child) => {
        (child as Mesh).geometry.deleteAttribute("color");
        (child as Mesh).geometry.deleteAttribute("position");
        (child as Mesh).geometry.dispose();
      });
      mesh?.children.forEach((child) => child.removeFromParent());
    };
  }, [tectonics, meshRef, showInternalBorders]);

  return (
    <TectonicsContext.Provider value={tectonics}>
      {children}
      <mesh ref={meshRef} {...props}></mesh>
    </TectonicsContext.Provider>
  );
};
