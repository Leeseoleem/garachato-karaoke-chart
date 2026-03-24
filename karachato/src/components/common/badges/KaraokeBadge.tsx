import clsx from "clsx";
import type { KaraokeProvider } from "@/types/domain";

export default function KaraokeBadge({
  provider,
}: {
  provider: KaraokeProvider;
}) {
  return (
    <div
      className={clsx(
        "shrink-0 flex justify-center items-center w-9 h-5 rounded-lg border-[1.5px] bg-brand-dark",
        provider === "TJ" ? "border-brand-accent" : "border-brand-light",
      )}
    >
      <p
        className={clsx(
          "typo-tag",
          provider === "TJ" ? "text-brand-accent" : "text-brand-light",
        )}
      >
        {provider}
      </p>
    </div>
  );
}
