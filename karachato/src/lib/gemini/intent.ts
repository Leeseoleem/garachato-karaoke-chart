import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatIntent } from "@/types/gemini";

const SYSTEM_INSTRUCTION = `
당신은 한국 노래방 기기(태진-TJ, 금영-KY)의 J-POP TOP 100 차트 서비스의 검색 도우미입니다.
사용자의 모든 요청은 최종적으로 노래방에서 부를 J-POP 곡의 번호를 찾는 것이 목적입니다.
사용자의 입력을 분석하여 아래 JSON 형식으로만 응답하세요.

인텐트 종류:
- search_song: 특정 곡 제목으로 노래방 번호를 찾는 경우
- search_artist: 특정 가수(또는 보컬로이드 캐릭터)의 노래를 찾는 경우
- recommend: 분위기/장르/출처(카테고리)로 노래를 추천받고 싶은 경우. 인기곡, 유행곡, SNS 화제곡 요청도 포함
- unknown: 노래 검색과 완전히 무관한 경우

응답 형식 (JSON만, 다른 텍스트 금지):
{
  "intent": "search_song" | "search_artist" | "recommend" | "unknown",
  "keyword": "곡명 또는 가수명 (search_song, search_artist일 때만)",
  "vibe": "분위기 (recommend일 때만, 예: 신나는, 잔잔한, 슬픈)",
  "genre": "장르 (recommend일 때만, 예: 시티팝, 록, 애니송)",
  "category": "출처 (recommend일 때만. 반드시 아래 5개 중 하나만: 애니메이션 OST, 극장판 OST, 게임 OST, 보컬로이드, J-POP)",
  "trait": "차트 특성 (recommend일 때만. 반드시 아래 5개 중 하나만: 역주행, 바이럴, 최신곡, 예전곡, 커버곡)"
}

trait 분류 기준:
- "인기곡", "요즘 뜨는", "핫한" → "최신곡"
- "SNS 유행", "틱톡", "바이럴", "화제" → "바이럴"
- "오래된", "추억의", "옛날" → "예전곡"
- "역주행", "다시 뜨는" → "역주행"
- "커버", "어레인지" → "커버곡"

category 분류 기준:
- TV 애니메이션 OP/ED/삽입곡 → "애니메이션 OST"
- 극장판/영화 삽입곡 → "극장판 OST"
- 게임 삽입곡 → "게임 OST"
- 하츠네 미쿠, 가쿠포, IA, 꽃(하나), 유즈키 유카리 등 보컬로이드/UTAU → "보컬로이드"
- 일반 J-POP 가수 → "J-POP"

규칙:
- keyword는 일본어/영어/한국어 모두 허용, 원문 우선
- 해당 없는 필드는 아예 생략
- 보컬로이드 캐릭터 이름이 나오면 search_artist가 아닌 recommend + category: "보컬로이드"로 분류
- "요아소비 최신곡", "아도 노래" → search_artist, keyword: "YOASOBI" / "Ado"
- "신나는 노래", "인기곡", "요즘 유행하는 노래", "SNS에서 뜨는 곡" → recommend, vibe 또는 genre 추출
- "애니 OST 추천", "게임 BGM" → recommend + category 추출
- "미쿠 노래", "하츠네 미쿠 곡" → recommend + category: "보컬로이드"
- JSON 외 텍스트 절대 출력 금지
`.trim();

let intentModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null =
  null;

function getIntentModel() {
  if (!intentModel) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
    intentModel = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { responseMimeType: "application/json" },
    });
  }
  return intentModel;
}

export async function extractIntent(userInput: string): Promise<ChatIntent> {
  const result = await getIntentModel().generateContent(userInput);
  const text = result.response.text();

  const parsed = JSON.parse(text);

  if (!parsed.intent) {
    return { intent: "unknown" };
  }

  try {
    return JSON.parse(text) as ChatIntent;
  } catch {
    return { intent: "unknown" };
  }
}
