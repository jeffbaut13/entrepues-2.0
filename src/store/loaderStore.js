import { create } from "zustand";

export const useLoaderStore = create((set) => ({
  hasSeenLoader: false,
  markLoaderAsSeen: () => set({ hasSeenLoader: true }),
  resetLoader: () => set({ hasSeenLoader: false }),
}));
