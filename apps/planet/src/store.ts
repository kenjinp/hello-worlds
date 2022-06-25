import { Camera } from "three";
import create from "zustand";

export interface Store {
  activeCamera: Camera | null;
  setActiveCamera: (camera: Camera) => void;
}

export const useStore = create<Store>((set) => ({
  activeCamera: null,
  setActiveCamera: (activeCamera: Camera) =>
    set((state) => ({
      ...state,
      activeCamera,
    })),
}));
