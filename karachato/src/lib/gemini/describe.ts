import type { Tool } from "@google/generative-ai";
import { getGemini } from "./gemini";

// 구글검색 그라운딩으로 "덕후 취향 사실 위주 + 해요체" 곡 소개를 생성한다.
// 번역/분류/점수는 translate.ts가 담당하고, 여기서는 description(산문)만 생성.

const buildDescribePrompt = (
  title: string,
  artist: string,
  category: string,
): string => {
  const dateExpr =
    category === "보컬로이드"
      ? "투고일과 투고 플랫폼(니코니코동화/유튜브 등)"
      : "발매일(연도)";
  const vocalExpr = category === "보컬로이드" ? ", 사용 보컬(미쿠/테토 등)" : "";

  return `"${title}" (${artist}) 라는 일본 곡(${category})에 대해 웹(특히 나무위키)에서 사실을 조사해서, 한국 노래방 이용자를 위한 곡 소개를 써줘.

포함할 내용(사실 위주, 확인된 것만):
- ${dateExpr}
- (애니/게임 수록곡이면) 어떤 작품의 OP/ED/OST/삽입곡인지
- 작곡가/프로듀서${vocalExpr}
- 화제가 된 계기(틱톡 역주행, 조회수 마일스톤, 드라마·광고·커버 등)
- 곡의 특징(간단히)

규칙:
- 반드시 해요체(~해요/~예요/~어요)로, 2~4문장.
- 확실하지 않은 날짜·플랫폼·수치는 지어내지 말고 생략.
- 분위기/무드 묘사는 최소화하고 사실·배경 위주로.
- 소개 문장만 출력(제목·라벨·마크다운·따옴표 없이).`.trim();
};

// 마크다운 기호·코드블록·앞뒤 따옴표 제거
const cleanDescription = (text: string): string =>
  text
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .replace(/^[#>\-*\s]+/, "")
    .replace(/^["'“”]|["'“”]$/g, "")
    .trim();

export const generateGroundedDescription = async (
  title: string,
  artist: string,
  category: string,
): Promise<string | null> => {
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
      // SDK 0.24 타입엔 googleSearch가 없지만(googleSearchRetrieval만 선언),
      // Gemini 2.5는 googleSearch 그라운딩을 런타임에서 지원함
      tools: [{ googleSearch: {} } as unknown as Tool],
    });

    const prompt = buildDescribePrompt(title, artist, category);
    const result = await model.generateContent(prompt);
    const text = cleanDescription(result.response.text());

    if (!text || text.length < 10) return null;
    return text;
  } catch (err) {
    console.error(
      `[generateGroundedDescription] 실패 - ${title} / ${artist}`,
      err,
    );
    return null;
  }
};
