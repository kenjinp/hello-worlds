import { useControls } from "leva";

export const DEFAULT_TERRAIN_PARAMS = {
  wireframe: false,
  scale: 1_000,
  width: 1_000,
  chunkSize: 500,
  visible: true,
  subdivisions: 128,
};

export const useTerrainController = () => {
  const controllerValues = useControls("terrain", {
    ...DEFAULT_TERRAIN_PARAMS,
    scale: {
      min: 0,
      value: 1000,
      step: 1,
    },
    width: {
      min: 0,
      value: 1000,
      step: 1,
    },
    chunkSize: {
      min: 0,
      max: 1000,
      value: 500,
      step: 1,
    },
    wireframe: false,
    visible: true,
    subdivisions: {
      min: 0,
      value: 128,
      step: 1,
    },
  });

  return controllerValues;
};
