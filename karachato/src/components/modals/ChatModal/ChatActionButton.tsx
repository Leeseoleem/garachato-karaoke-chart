"use client";

import clsx from "clsx";

type ChatActionButtonVariant = "primary" | "secondary" | "retry";

interface ChatActionButtonProps {
  onClick: () => void;
  variant?: ChatActionButtonVariant;
}

const variantConfig: Record<
  ChatActionButtonVariant,
  { label: string; style: string; text: string }
> = {
  primary: {
    label: "맞아요",
    style: "bg-brand-main hover:brightness-110 active:brightness-75",
    text: "text-gray-white",
  },
  secondary: {
    label: "아니에요",
    style: "border border-brand-main hover:bg-gray-40 active:bg-gray-50",
    text: "text-gray-white",
  },
  retry: {
    label: "다시 시도",
    style: "border border-status-up hover:bg-gray-40 active:bg-gray-50",
    text: "text-status-up",
  },
};

export default function ChatActionButton({
  variant = "secondary",
  onClick,
}: ChatActionButtonProps) {
  const { label, style, text } = variantConfig[variant];
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-30 py-2 justify-center items-center rounded-2xl duration-150 transition-colors",
        style,
      )}
    >
      <p className={clsx(text, "typo-caption")}>{label}</p>
    </button>
  );
}
