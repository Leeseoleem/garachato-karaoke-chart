import clsx from "clsx";

interface TextBubbleProps {
  role: "user" | "model";
  content: string;
}

export function TextBubble({ role, content }: TextBubbleProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl px-3 py-2 typo-caption leading-relaxed",
        "max-w-[75%]",
        role === "user"
          ? "bg-brand-main text-white self-end rounded-br-sm"
          : "bg-gray-20 text-content-primary self-start rounded-bl-sm",
      )}
    >
      {content}
    </div>
  );
}
