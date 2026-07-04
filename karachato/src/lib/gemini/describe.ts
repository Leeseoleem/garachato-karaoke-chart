import type { Tool } from "@google/generative-ai";
import { getGemini } from "./gemini";

// 구글검색 그라운딩으로 "산문 소개(설명) + 구조화 사실 리스트(상세 설명)"를 함께 생성.
// 번역/분류/점수는 translate.ts가 담당하고, 여기서는 곡 소개(description + ai_intro)만.

export interface SongFact {
  label: string;
  value: string;
}
export interface SongIntro {
  description: string; // 산문 소개 (설명)
  facts: SongFact[]; // 구조화 리스트 (상세 설명) — 곡 종류별 유연 항목
}

const buildIntroPrompt = (
  title: string,
  artist: string,
  category: string,
): string => {
  const isVocaloid = category === "보컬로이드";
  const factExample = isVocaloid
    ? "투고일 | 2020.5.10 니코니코동화\n프로듀서 | DECO*27\n보컬 | 하츠네 미쿠\n수록 | 프로젝트 세카이\n화제 | 유튜브 1억 재생"
    : "발매일 | 2020년\n아티스트 | 요네즈 켄시\n앨범 | STRAY SHEEP\n타이업 | OO 드라마 주제가\n화제 | 틱톡 역주행";

  return `"${title}" (${artist}) 라는 일본 곡(${category})에 대해 웹(특히 나무위키)에서 사실을 조사해서, 한국 노래방 이용자를 위한 곡 소개를 아래 형식 그대로 써줘.

[소개]
(2~3문장, 해요체로 곡을 소개. 분위기 묘사보다 사실·배경 위주.)

[상세]
(핵심 사실을 "항목 | 값" 형식으로 한 줄씩. 곡 종류에 맞는 항목만, 확인된 것만, 최대 6줄.)
예)
${factExample}

규칙:
- [소개]와 [상세] 둘 다 반드시 포함.
- [소개]는 해요체 2~3문장. [상세]는 "항목 | 값" 형식만(값도 간결히).
- 확실하지 않은 날짜·수치·플랫폼·수록작은 넣지 말 것(지어내기 금지).
- 마이너한 2차 창작·커버·불확실한 딥컷 트리비아 제외, 핵심적이고 검증 가능한 사실만.
- 조회수·순위 같은 구체적 수치 기록은 좋음(확실한 것만).
- 노래방·가라오케 번호는 [상세]에 넣지 마세요(앱에서 별도 표시됨).
- [소개] 첫 문장에서 곡 제목을 따옴표로 감싸지 말고 자연스럽게 시작하세요.
- [상세]에서 같은 항목명을 두 번 쓰지 마세요.
- 마크다운·번호·따옴표 없이 순수 텍스트로.`;
};

const stripMarkdown = (s: string): string =>
  s
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .replace(/^["'“”]|["'“”]$/g, "")
    .trim();

// "[소개] … [상세] 항목 | 값 …" 텍스트를 파싱
const parseIntro = (text: string): SongIntro => {
  const cleaned = stripMarkdown(text);
  const parts = cleaned.split(/\[\s*상세\s*\]/);
  const description = stripMarkdown(
    (parts[0] ?? "").replace(/\[\s*소개\s*\]/g, "").trim(),
  );
  const factsRaw = parts[1] ?? "";

  const facts = factsRaw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("|"))
    .map((line) => {
      const idx = line.indexOf("|");
      return {
        label: line
          .slice(0, idx)
          .trim()
          .replace(/^[-*•\d.)\s]+/, ""),
        value: line.slice(idx + 1).trim(),
      };
    })
    .filter((f) => f.label && f.value)
    .slice(0, 6);

  return { description, facts };
};

export const generateSongIntro = async (
  title: string,
  artist: string,
  category: string,
): Promise<SongIntro | null> => {
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
      // SDK 0.24 타입엔 googleSearch가 없지만(googleSearchRetrieval만 선언),
      // Gemini 2.5는 googleSearch 그라운딩을 런타임에서 지원함
      tools: [{ googleSearch: {} } as unknown as Tool],
    });

    const result = await model.generateContent(
      buildIntroPrompt(title, artist, category),
    );
    const intro = parseIntro(result.response.text());

    if (!intro.description || intro.description.length < 10) return null;
    return intro;
  } catch (err) {
    console.error(`[generateSongIntro] 실패 - ${title} / ${artist}`, err);
    return null;
  }
};
