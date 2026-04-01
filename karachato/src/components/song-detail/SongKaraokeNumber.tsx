"use client";

import clsx from "clsx";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import type { KaraokeProvider } from "@/types/domain";

interface SongKaraokeNumberProps {
  provider: KaraokeProvider;
  karaokeNo?: string;
}

export default function SongKaraokeNumber({
  provider,
  karaokeNo,
}: SongKaraokeNumberProps) {
  const isDisabled = !karaokeNo;

  return (
    <div
      className={clsx(
        "flex flex-row w-full justify-between items-center px-2 py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-3 rounded-lg border border-gray-20 bg-gray-30",
        isDisabled && "opacity-40",
      )}
    >
      <div className="flex flex-row items-center gap-3">
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
        <p className="typo-subtitle text-gray-white">{karaokeNo ?? "-"}</p>
      </div>
      <button
        type="button"
        aria-label={`${provider} 번호 복사`}
        disabled={isDisabled}
        onClick={() => {
          if (!karaokeNo) return;
          navigator.clipboard.writeText(karaokeNo);

          // 마우스 환경(데스크탑)에서만 토스트 표시
          const isDesktop = window.matchMedia("(pointer: fine)").matches;
          if (isDesktop) {
            toast("노래방 번호가 복사되었습니다.", {
              position: "bottom-center",
              style: {
                fontFamily: "Pretendard, ...",
                borderRadius: "20px",
                background: "#333",
                color: "#fff",
                fontSize: "14px",
              },
            });
          }
        }}
        className="disabled:cursor-not-allowed disabled:pointer-events-none hover:opacity-70 active:opacity-50 transition-opacity"
      >
        <Copy color="#ffffff" size={16} />
      </button>
    </div>
  );
}
