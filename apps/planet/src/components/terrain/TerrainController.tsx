import { useControls } from "leva";

export const DEFAULT_TERRAIN_PARAMS = {
  wireframe: false,
  inverted: false,
};

export const useTerrainController = () => {
  const controllerValues = useControls("terrain", DEFAULT_TERRAIN_PARAMS);

  return controllerValues;
};
