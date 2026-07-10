import Link from "next/link";
import clsx from "clsx";
import type { AiCategory } from "@/types/domain";

// 카테고리 필터. 순서는 사용자 직관 우선(보컬로이드·애니 먼저).
export const CATEGORIES: AiCategory[] = [
  "보컬로이드",
  "애니메이션 OST",
  "극장판 OST",
  "게임 OST",
  "J-POP",
];

// 웹은 서버 렌더 → 칩을 Link로 두고 ?category= 로 재조회. active는 현재 선택값을 prop으로 받음.
export default function CategoryChips({
  active,
}: {
  active: AiCategory | null;
}) {
  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto px-5 py-3 [&::-webkit-scrollbar]:hidden">
      <Chip label="전체" href="/explore" active={active === null} />
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={category}
          href={`/explore?category=${encodeURIComponent(category)}`}
          active={active === category}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 typo-caption transition-colors",
        active
          ? "bg-brand-main text-gray-white"
          : "bg-gray-40 text-content-secondary",
      )}
    >
      {label}
    </Link>
  );
}
