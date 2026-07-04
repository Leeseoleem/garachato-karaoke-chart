import clsx from "clsx";
export interface DifficultyItemProps {
  label: string;
  score: number;
  reason: string;
}

const TOTAL = 5;

export default function DifficultyItem({
  label,
  score,
  reason,
}: DifficultyItemProps) {
  const normalizedScore = Math.max(0, Math.min(TOTAL, Math.floor(score ?? 0)));

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex flex-row justify-between items-center">
        <p className="typo-label text-brand-light">{label}</p>
        <div className="flex flex-row gap-1 items-center">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "w-2 h-2 rounded-full",
                i < (normalizedScore ?? 0) ? "bg-brand-main" : "bg-brand-dark",
              )}
            />
          ))}
        </div>
      </div>
      {reason && (
        <p className="typo-caption text-content-primary whitespace-pre-line wrap-break-word">
          {reason}
        </p>
      )}
    </div>
  );
}
