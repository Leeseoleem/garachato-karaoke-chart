import { create } from "zustand";
import type { DisplayMode } from "@/types/ui";

interface ChartStore {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  displayMode: "translated",
  setDisplayMode: (mode) => set({ displayMode: mode }),
}));
