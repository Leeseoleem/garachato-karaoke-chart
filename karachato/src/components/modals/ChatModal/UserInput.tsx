"use client";
import clsx from "clsx";
import { SendHorizontal } from "lucide-react";
import { useRef, useEffect } from "react";

interface UserInputProps {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  disabled?: boolean;
}

export default function UserInput({
  placeholder = "찾고 싶은 곡이 있나요?",
  value,
  onChange,
  onSubmit,
  maxLength,
  disabled = false,
}: UserInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const textClass =
    "typo-body text-gray-white placeholder:text-content-secondary";

  const isButtonActive = value.trim().length > 0 && !disabled;

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-row justify-baseline items-center gap-1">
        <textarea
          ref={textareaRef}
          className={clsx(
            "flex-1 rounded-4xl bg-gray-30 resize-none overflow-y-auto",
            "min-h-[52px] max-h-[150px]",
            "px-5 py-[14px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50",
            "leading-normal scrollbar-hide",
            "[&::-webkit-scrollbar]:hidden", // 크롬/사파리 스크롤바 숨김
            "[-ms-overflow-style:none]", // IE 스크롤바 숨김
            "[scrollbar-width:none]", // 파이어폭스 스크롤바 숨김
            textClass,
            disabled && "opacity-50 cursor-not-allowed",
          )}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          spellCheck={false}
          rows={1}
        />
        <button
          type="submit"
          aria-label="채팅 전송"
          onClick={onSubmit}
          disabled={!isButtonActive}
          className={clsx(
            "shrink-0 p-2 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50",
            disabled
              ? "cursor-not-allowed opacity-50"
              : isButtonActive
                ? "cursor-pointer hover:bg-gray-40 active:bg-gray-30"
                : "cursor-not-allowed",
          )}
        >
          <SendHorizontal
            size={36}
            color={isButtonActive ? "#7c5cbf" : "#232329"}
          />
        </button>
      </div>
      <p className="text-[10px] font-medium text-content-secondary text-center">
        챠토봇은 AI이며 실제와 다른 정보를 제공할 수 있습니다.
      </p>
    </div>
  );
}
