import { Vector3 } from "three";
import create from "zustand";

export const useStore = create<{
  playerSpawnPositions: Vector3[];
  addPlayerSpawnPosition: (position: Vector3) => void;
}>((set) => ({
  playerSpawnPositions: [],
  addPlayerSpawnPosition: (position: Vector3) =>
    set((state) => ({
      playerSpawnPositions: [...state.playerSpawnPositions, position],
    })),
}));
