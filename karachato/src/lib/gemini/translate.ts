import { getGemini } from "./gemini";
import type { TranslateResult } from "@/types/gemini";

export const buildTranslatePrompt = (
  title: string,
  artist: string,
  provider: "TJ" | "KY",
): string =>
  `
당신은 J-POP 전문 번역가이자 음악 큐레이터입니다.
아래 노래방(${provider}) 곡 정보를 분석하고, JSON으로만 응답하세요.
마크다운 코드블록(\`\`\`json)이나 추가 설명 없이 순수 JSON만 반환하세요.

곡 제목 (원문): ${title}
가수명 (원문): ${artist}

---

응답 형식:
{
  "title_ko": "한글로 번역한 제목. 영어가 포함된 경우 영어는 그대로 유지",
  "title_ko_jp": "일본어 부분만 한글로 번역, 영어는 원문 유지. 예: アイドル/IDOL → 아이돌/IDOL",
  "title_ko_full": "일본어와 영어 모두 한글로 번역. 예: アイドル/IDOL → 아이돌/아이돌",
  "description": "이 곡의 분위기, 장르, 특징을 한국어로 2~3문장으로 설명",
  "ai_category": "아래 5개 중 하나만 선택: 애니메이션 OST | 극장판 OST | 게임 OST | 보컬로이드 | J-POP",
  "ai_category_detail": "곡의 배경을 1~2문장으로. 예: 애니메이션 제목, 원작 정보 등. 불명확하면 null",
  "ai_traits": ["아래 허용값 중 해당하는 것만 포함. 없으면 빈 배열"],
  "ai_genres": ["장르 태그를 배열로. 예: 록, 시티팝, 일렉트로니카, 발라드, 팝"],
  "ai_vibes": ["분위기 키워드를 배열로. 예: 신나는, 몽환적인, 감성적인, 중독적인, 잔잔한"],
  "ai_vocal_score": 1~5 사이 정수,
  "ai_vocal_reason": "보컬 난이도 이유 1~2문장",
  "ai_pronunciation_score": 1~5 사이 정수,
  "ai_pronunciation_reason": "발음 난이도 이유 1~2문장",
  "ai_karaoke_tip": "노래방에서 이 곡을 부를 때 유용한 팁 1~2문장"
}

---

규칙:
- ai_category: 반드시 5개 중 하나. 보컬로이드 곡은 J-POP이 아닌 보컬로이드로 분류
- ai_traits 허용값: 역주행 | 바이럴 | 최신곡 | 예전곡 | 커버곡 (이 외의 값은 절대 사용 금지)
- ai_genres: 3개 이내
- ai_vibes: 3개 이내
- ai_vocal_score / ai_pronunciation_score: 1(매우 쉬움) ~ 5(매우 어려움)
- ai_category_detail: 확실하지 않으면 반드시 null
`.trim();

// 실제 번역 실행 함수
export const translateSong = async (
  title: string,
  artist: string,
  provider: "TJ" | "KY",
): Promise<TranslateResult | null> => {
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildTranslatePrompt(title, artist, provider);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // 혹시 Gemini가 ```json ... ``` 으로 감쌌을 경우 제거
    const clean = text.replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed: TranslateResult = JSON.parse(clean);

    // 필수 필드 검증
    if (
      !parsed.title_ko ||
      !parsed.title_ko_jp ||
      !parsed.title_ko_full ||
      !parsed.description ||
      !parsed.ai_category
    ) {
      throw new Error("필수 필드 누락");
    }

    return parsed;
  } catch (err) {
    console.error(`[translateSong] 실패 - ${title} / ${artist}`, err);
    return null; // null 반환 시 호출부에서 ai_status: failed 처리
  }
};
