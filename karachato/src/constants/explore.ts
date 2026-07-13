import type { AiCategory } from "@/types/domain";

// 탐색 카테고리 (순서: 사용자 직관 우선 — 보컬로이드·애니 먼저)
export const CATEGORIES: AiCategory[] = [
  "보컬로이드",
  "애니메이션 OST",
  "극장판 OST",
  "게임 OST",
  "J-POP",
];

// 보컬로이드 캐릭터 (칩 필터용). artist_in_provider에서 매칭해 한글명으로 표시.
export const VOCALOID_CHARACTERS: { ko: string; match: RegExp }[] = [
  { ko: "하츠네 미쿠", match: /初音ミク/ },
  { ko: "카사네 테토", match: /重音テト/ },
  { ko: "카가미네 린", match: /鏡音リン/ },
  { ko: "카가미네 렌", match: /鏡音レン/ },
  { ko: "메구리네 루카", match: /巡音ルカ/ },
  { ko: "구미", match: /\bGUMI\b/i },
  { ko: "IA", match: /\bIA\b/ },
  { ko: "카이토", match: /KAITO/ },
  { ko: "메이코", match: /MEIKO/ },
  { ko: "카후", match: /可不/ },
  { ko: "카아이 유키", match: /歌愛ユキ/ },
  { ko: "플라워", match: /\bFlower\b/i },
];
