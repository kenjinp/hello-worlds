import { Html } from "@react-three/drei";
import * as React from "react";
import { Object3D } from "three";
import { Plate } from "./Plate";
import { useTectonics } from "./TectonicsComponent";

export const PlateLabel: React.FC<{
  plate: Plate;
  occludeRef?: React.RefObject<Object3D<Event>>[];
}> = ({ plate, occludeRef }) => {
  const [hidden, setHidden] = React.useState(false);

  return (
    <Html
      position={plate.startRegion.region.properties.siteXYZ}
      occlude={occludeRef}
      onOcclude={(hidden) => {
        setHidden(hidden);
        return null;
      }}
      style={{
        transition: "all 0.25s ease-out",
        opacity: hidden ? 0 : 1,
        transform: `scale(${hidden ? 0.5 : 1})`,
      }}
    >
      <div
        style={{
          padding: "0.5em",
          borderRadius: "4px",
          background: "black",
          whiteSpace: "nowrap",
          color: `#${plate.color.getHexString()}`,
          boxShadow: `1px 0px 7px black`,
        }}
      >
        <span>
          {plate.name} {plate.oceanic ? "🌊" : "⛰"}
        </span>
      </div>
    </Html>
  );
};

export const PlateLabels: React.FC<{
  occludeRef?: React.RefObject<Object3D<Event>>[];
}> = ({ occludeRef }) => {
  const tectonics = useTectonics();
  const labels = React.useMemo(() => {
    return Array.from(tectonics.plates.values()).map((plate) => {
      return (
        <PlateLabel key={plate.name} plate={plate} occludeRef={occludeRef} />
      );
    });
  }, [occludeRef, tectonics]);
  return <>{labels}</>;
};
