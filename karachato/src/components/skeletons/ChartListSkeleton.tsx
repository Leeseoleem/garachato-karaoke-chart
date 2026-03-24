import { RankCardSkeleton } from "./RankCardSkeleton";

export function ChartListSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-y-hidden">
      <div className="flex flex-row justify-between px-5 py-3">
        <span className="typo-caption text-content-secondary">TOP 100</span>
        <span className="typo-caption text-content-secondary">
          0000-00-00 기준
        </span>
      </div>
      <div className="flex flex-col bg-linear-to-b from-brand-dark to-gray-30 rounded-t-2xl overflow-y-hidden">
        <div className="flex flex-row h-13" />
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <RankCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
