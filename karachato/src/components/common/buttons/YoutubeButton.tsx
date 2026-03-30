"use client";

import clsx from "clsx";
import { Play } from "lucide-react";

export default function YoutubeButton({ url }: { url?: string }) {
  const handleClick = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const baseClass =
    "flex border border-status-up rounded-lg min-h-6 min-w-6 w-full justify-center items-center bg-brand-dark";
  const bgClass =
    "bg-brand-dark hover:bg-brand-dark/80 active:bg-brand-dark/60 transition-colors duration-150";
  const disabledClass = "disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <button
      type="button"
      aria-label="유튜브에서 보기"
      disabled={!url}
      className={clsx(baseClass, bgClass, disabledClass)}
      onClick={handleClick}
    >
      <Play
        size={8}
        fill="#FF6B6B"
        color="#FF6B6B"
        strokeWidth={1.5}
        absoluteStrokeWidth
      />
    </button>
  );
}
