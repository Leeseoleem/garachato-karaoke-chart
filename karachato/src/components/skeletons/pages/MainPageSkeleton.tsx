import { ChartListSkeleton } from "../ChartListSkeleton";

export function MainPageSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-row w-full h-25 px-4 items-center gap-3">
        <div className="w-full px-5 pr-12 h-13 rounded-full search-border outline-none bg-transparent" />
        <div className="shrink-0 flex items-center justify-center rounded-full glass h-13 w-13" />
      </div>
      <ChartListSkeleton />
    </div>
  );
}
