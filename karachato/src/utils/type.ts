import type { KaraokeProvider } from "@/types/domain";

export function isKaraokeProvider(value: string): value is KaraokeProvider {
  return value === "TJ" || value === "KY";
}
