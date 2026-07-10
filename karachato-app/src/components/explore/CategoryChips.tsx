import clsx from "clsx";
import { CATEGORIES } from "@/constants/explore";
import type { AiCategory } from "@/types/domain";

interface CategoryChipsProps {
  active: AiCategory | null;
  onChange: (category: AiCategory | null) => void;
}

export default function CategoryChips({ active, onChange }: CategoryChipsProps) {
  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto px-5 py-3 [&::-webkit-scrollbar]:hidden">
      <Chip label="전체" active={active === null} onClick={() => onChange(null)} />
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={category}
          active={active === category}
          onClick={() => onChange(category)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 typo-caption transition-colors",
        active
          ? "bg-brand-main text-gray-white"
          : "bg-gray-40 text-content-secondary",
      )}
    >
      {label}
    </button>
  );
}
