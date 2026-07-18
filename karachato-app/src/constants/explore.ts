import type { AiCategory } from "@/types/domain";

// "차트에 새로 진입했어요" 섹션 기준: created_at(=차트 첫 진입)이 최근 N일 이내인 곡만.
// (안 그러면 전체 done 곡이 등록일순으로 다 나와 사실상 카탈로그가 됨)
export const RECENT_WINDOW_DAYS = 30;

// 탐색 카테고리 필터 (순서: 사용자 직관 우선 — 보컬로이드·애니 먼저).
// J-POP은 제외(앱 전체가 J-POP이라 카테고리로서 무의미). 게임 OST는 곡이 생기면 자동 노출.
export const CATEGORIES: AiCategory[] = [
  "보컬로이드",
  "애니메이션 OST",
  "극장판 OST",
  "게임 OST",
];

// 보컬로이드 캐릭터 (칩 필터용). artist_in_provider에서 매칭해 한글명으로 표시.
// vocal_tags에는 특성만 있어 이름을 못 뽑으므로 여기서 원문 캐릭터명 ↔ 한글명 매핑.
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
