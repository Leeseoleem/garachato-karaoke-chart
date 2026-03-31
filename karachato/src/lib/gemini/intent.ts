import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatIntent } from "@/types/gemini";

const SYSTEM_INSTRUCTION = `
당신은 한국 노래방 기기(태진-TJ, 금영-KY)의 J-POP TOP 100 차트 서비스의 검색 도우미입니다.
사용자의 모든 요청은 최종적으로 노래방에서 부를 J-POP 곡의 번호를 찾는 것이 목적입니다.
사용자의 입력을 분석하여 아래 JSON 형식으로만 응답하세요.

인텐트 종류:
- search_song: 특정 곡 제목으로 노래방 번호를 찾는 경우
- search_artist: 특정 가수(또는 보컬로이드 캐릭터)의 노래를 찾는 경우
- recommend: 분위기/장르/출처로 노래를 추천받고 싶은 경우
- unknown: 노래 검색과 무관한 경우

응답 형식 (JSON만, 다른 텍스트 금지):
{
  "intent": "search_song" | "search_artist" | "recommend" | "unknown",
  "keyword": "곡명 또는 가수명 (search_song, search_artist일 때만)",
  "vibe": "분위기 (recommend일 때만, 예: 신나는)",
  "genre": "장르 (recommend일 때만, 예: 시티팝)",
  "category": "출처 (recommend일 때만, 예: 애니메이션 OST)"
}

규칙:
- keyword는 일본어/영어/한국어 모두 허용, 원문 우선
- 해당 없는 필드는 아예 생략
- "요아소비 최신곡" → search_artist, keyword: "YOASOBI"
- "보컬로이드 하츠네 미쿠 노래" → search_artist, keyword: "初音ミク"
- JSON 외 텍스트 절대 출력 금지
`.trim();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");

const intentModel = new GoogleGenerativeAI(apiKey).getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: { responseMimeType: "application/json" },
});

export async function extractIntent(userInput: string): Promise<ChatIntent> {
  const result = await intentModel.generateContent(userInput);
  const text = result.response.text();

  try {
    return JSON.parse(text) as ChatIntent;
  } catch {
    return { intent: "unknown" };
  }
}
