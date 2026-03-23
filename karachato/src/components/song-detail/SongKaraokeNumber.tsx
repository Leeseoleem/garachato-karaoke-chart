import clsx from "clsx";
import { Copy } from "lucide-react";
import type { KaraokeProvider } from "@/types/domain";

interface SongKaraokeNumberProps {
  provider: KaraokeProvider;
  karaokeNo?: number;
  onCopy?: (karaokeNo: number) => void;
}

export default function SongKaraokeNumber({
  provider,
  karaokeNo,
  onCopy,
}: SongKaraokeNumberProps) {
  const isDisabled = !karaokeNo;

  return (
    <div
      className={clsx(
        "flex flex-row justify-between items-center px-4 py-3 rounded-lg border border-gray-20 bg-gray-30",
        isDisabled && "opacity-40",
      )}
    >
      <div className="flex flex-row items-center gap-1">
        <p
          className={clsx(
            "typo-body px-2 py-1 rounded-sm",
            provider === "TJ"
              ? "text-kara-tj-text bg-kara-tj-bg"
              : "text-kara-ky-text bg-kara-ky-bg",
          )}
        >
          {provider}
        </p>
        <p className="typo-title-02 text-gray-white">{karaokeNo ?? "-"}</p>
      </div>
      <button
        type="button"
        aria-label={`${provider} 번호 복사`}
        disabled={isDisabled}
        onClick={() => karaokeNo && onCopy?.(karaokeNo)}
        className="disabled:cursor-not-allowed hover:opacity-70 active:opacity-50 transition-opacity"
      >
        <Copy color="text-content-primary" />
      </button>
    </div>
  );
}
