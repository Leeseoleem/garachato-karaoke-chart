import { create } from "zustand";
import type { DisplayMode, TranslationScope } from "@/types/ui";

interface ChartStore {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  translationScope: TranslationScope;
  setTranslationScope: (scope: TranslationScope) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  displayMode: "translated",
  setDisplayMode: (mode) => set({ displayMode: mode }),
  translationScope: "jp_only",
  setTranslationScope: (scope) => set({ translationScope: scope }),
}));
