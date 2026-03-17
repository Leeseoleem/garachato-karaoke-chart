"use client";
import clsx from "clsx";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  size?: "default" | "large";
  ariaLabel: string;
  disabled?: boolean;
}

export default function IconButton({
  icon,
  onClick,
  size = "default",
  ariaLabel,
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      className={clsx(
        "flex items-center justify-center rounded-full glass",
        size === "large" ? "h-13 w-13" : "h-12 w-12",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}
