import clsx from "clsx";

interface SkeletonBoxProps {
  className?: string;
  elevated?: boolean;
}

export function SkeletonBox({ className, elevated = false }: SkeletonBoxProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-md",
        elevated ? "bg-skeleton-base-elevated" : "bg-skeleton-base",
        className,
      )}
    />
  );
}
