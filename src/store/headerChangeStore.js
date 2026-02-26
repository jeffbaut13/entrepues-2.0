import { create } from "zustand";

export const useHeaderChangeStore = create((set) => ({
  changeColor: false,

  setChangeDark: () => set({ changeColor: true }),

  setChangeLight: () => set({ changeColor: false }),
}));
