import { ChartListSkeleton } from "../ChartListSkeleton";

export function MainPageSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="h-16" />
      <ChartListSkeleton />
    </div>
  );
}
