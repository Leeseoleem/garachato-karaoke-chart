import { getGemini } from "./gemini";
import type { TranslateResult } from "@/types/gemini";

const SYSTEM_INSTRUCTION =
  "당신은 J-POP 전문 번역가이자 음악 큐레이터입니다. 요청된 곡 정보를 분석하고 반드시 지정된 JSON 형식으로만 응답하세요.";

// 배치용 입력 타입
interface BatchInput {
  index: number;
  title: string;
  artist: string;
  provider: "TJ" | "KY";
}

// 배치용 출력 타입
type BatchResult = (TranslateResult & { index: number }) | null;

export const buildTranslatePrompt = (
  title: string,
  artist: string,
  provider: "TJ" | "KY",
): string =>
  `
아래 노래방(${provider}) 곡 정보를 분석하고, JSON으로만 응답하세요.

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

export const buildBatchPrompt = (songs: BatchInput[]): string => {
  const songList = songs
    .map(
      (s) =>
        `[${s.index}] 제목: ${s.title} / 가수: ${s.artist} / 노래방: ${s.provider}`,
    )
    .join("\n");

  return `
아래 ${songs.length}곡을 분석하고, 반드시 JSON 배열로만 응답하세요.
각 곡의 index를 반드시 포함하세요.

${songList}

---

응답 형식 (JSON 배열):
[
  {
    "index": 0,
    "title_ko": "한글로 번역한 제목. 영어가 포함된 경우 영어는 그대로 유지",
    "title_ko_jp": "일본어 부분만 한글로 번역, 영어는 원문 유지. 예: アイドル/IDOL → 아이돌/IDOL",
    "title_ko_full": "일본어와 영어 모두 한글로 번역. 예: アイドル/IDOL → 아이돌/아이돌",
    "description": "이 곡의 분위기, 장르, 특징을 한국어로 2~3문장으로 설명",
    "ai_category": "아래 5개 중 하나만 선택: 애니메이션 OST | 극장판 OST | 게임 OST | 보컬로이드 | J-POP",
    "ai_category_detail": "곡의 배경을 1~2문장으로. 불명확하면 null",
    "ai_traits": ["허용값 중 해당하는 것만. 없으면 빈 배열"],
    "ai_genres": ["장르 태그 배열. 3개 이내"],
    "ai_vibes": ["분위기 키워드 배열. 3개 이내"],
    "ai_vocal_score": 1~5 사이 정수,
    "ai_vocal_reason": "보컬 난이도 이유 1~2문장",
    "ai_pronunciation_score": 1~5 사이 정수,
    "ai_pronunciation_reason": "발음 난이도 이유 1~2문장",
    "ai_karaoke_tip": "노래방 팁 1~2문장"
  },
  ...나머지 곡들
]

---

규칙:
- 반드시 입력된 모든 곡에 대한 결과를 반환하세요
- ai_category: 반드시 5개 중 하나. 보컬로이드 곡은 J-POP이 아닌 보컬로이드로 분류
- ai_traits 허용값: 역주행 | 바이럴 | 최신곡 | 예전곡 | 커버곡 (이 외의 값은 절대 사용 금지)
- ai_genres: 3개 이내
- ai_vibes: 3개 이내
- ai_vocal_score / ai_pronunciation_score: 1(매우 쉬움) ~ 5(매우 어려움)
- ai_category_detail: 확실하지 않으면 반드시 null
`.trim();
};

// 단건 번역 함수 (기존 유지)
export const translateSong = async (
  title: string,
  artist: string,
  provider: "TJ" | "KY",
): Promise<TranslateResult | null> => {
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = buildTranslatePrompt(title, artist, provider);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const clean = text.replace(/^[^{]*|[^}]*$/g, "").trim();
    const parsed: TranslateResult = JSON.parse(clean);

    if (
      !parsed.title_ko ||
      !parsed.title_ko_jp ||
      !parsed.title_ko_full ||
      !parsed.description ||
      !parsed.ai_category
    ) {
      throw new Error("필수 필드 누락");
    }

    if (
      typeof parsed.ai_vocal_score !== "number" ||
      parsed.ai_vocal_score < 1 ||
      parsed.ai_vocal_score > 5 ||
      typeof parsed.ai_pronunciation_score !== "number" ||
      parsed.ai_pronunciation_score < 1 ||
      parsed.ai_pronunciation_score > 5
    ) {
      throw new Error("점수 범위 오류");
    }

    return parsed;
  } catch (err) {
    console.error(`[translateSong] 실패 - ${title} / ${artist}`, err);
    return null;
  }
};

// 배치 번역 함수 (10곡씩 묶어서 호출)
export const translateSongBatch = async (
  songs: BatchInput[],
): Promise<BatchResult[]> => {
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = buildBatchPrompt(songs);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // 배열 파싱: 직접 파싱, 실패 시에만 정규식 적용
    let parsed: (TranslateResult & { index: number })[];
    try {
      parsed = JSON.parse(text);
    } catch {
      const clean = text.replace(/^[^\[]*|[^\]]*$/g, "").trim();
      parsed = JSON.parse(clean);
    }

    // index 기준으로 정렬 후 개별 검증
    return songs.map((s) => {
      const item = parsed.find((p) => p.index === s.index);
      if (
        !item ||
        !item.title_ko ||
        !item.title_ko_jp ||
        !item.title_ko_full ||
        !item.description ||
        !item.ai_category
      ) {
        console.error(
          `[translateSongBatch] 개별 곡 검증 실패 - index: ${s.index} / ${s.title}`,
        );
        return null;
      }
      return item;
    });
  } catch (err) {
    console.error(`[translateSongBatch] 배치 전체 실패`, err);
    // 전체 실패 시 songs 개수만큼 null 배열 반환
    return songs.map(() => null);
  }
};
