import clsx from "clsx";

interface SkeletonTextProps {
  className?: string;
  elevated?: boolean;
}

export function SkeletonText({
  className,
  elevated = false,
}: SkeletonTextProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded",
        elevated ? "bg-skeleton-base-elevated" : "bg-skeleton-base",
        className,
      )}
    />
  );
}
