// 보컬로이드 캐릭터 → 속성 태그(성별·머리색·상징) 맵.
// DB에 곡이 있는 캐릭터만. artist_in_provider("...(Feat.初音ミク)")에서 매칭한다.
// songs.vocal_tags의 단일 소스 — 신규 곡은 process.ts가 이 맵으로 자동 태깅.
const VOCALOID_TRAITS: { match: RegExp; tags: string[] }[] = [
  { match: /初音ミク/, tags: ["보컬로이드", "여성", "파란머리", "대파"] },
  { match: /鏡音リン/, tags: ["보컬로이드", "여성", "노란머리"] },
  { match: /鏡音レン/, tags: ["보컬로이드", "남성", "노란머리", "바나나"] },
  { match: /巡音ルカ/, tags: ["보컬로이드", "여성", "분홍머리", "참치"] },
  { match: /重音テト/, tags: ["보컬로이드", "여성", "빨간머리", "프랑스빵"] },
  { match: /\bGUMI\b/i, tags: ["보컬로이드", "여성", "초록머리", "당근"] }, // \b로 Megumi 등 오탐 방지
  { match: /\bIA\b/, tags: ["보컬로이드", "여성", "분홍머리"] }, // \b로 Maria 등 오탐 방지
  { match: /可不/, tags: ["보컬로이드", "여성", "은발"] },
  { match: /歌愛ユキ/, tags: ["보컬로이드", "여성", "검은머리"] },
  { match: /\bFlower\b/i, tags: ["보컬로이드", "중성", "검은머리"] }, // \b로 Sunflower 등 오탐 방지
];

// 곡의 트랙 아티스트 표기들에서 등장하는 보컬로이드 캐릭터의 태그를 합집합으로.
// 보컬로이드가 없으면 null(일반 곡).
export function deriveVocalTags(artistStrings: string[]): string[] | null {
  const tags = new Set<string>();
  for (const artist of artistStrings) {
    for (const { match, tags: t } of VOCALOID_TRAITS) {
      if (match.test(artist)) t.forEach((x) => tags.add(x));
    }
  }
  return tags.size > 0 ? [...tags] : null;
}
