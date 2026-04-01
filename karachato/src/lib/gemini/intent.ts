import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatIntent } from "@/types/gemini";

const SYSTEM_INSTRUCTION = `
당신은 한국 노래방 기기(태진-TJ, 금영-KY)의 J-POP TOP 100 차트 서비스의 검색 도우미입니다.
사용자의 모든 요청은 최종적으로 노래방에서 부를 J-POP 곡의 번호를 찾는 것이 목적입니다.
사용자의 입력을 분석하여 아래 JSON 형식으로만 응답하세요.

인텐트 종류:
- search_song: 특정 곡 제목으로 노래방 번호를 찾는 경우
- search_artist: 특정 가수(또는 보컬로이드 캐릭터)의 노래를 찾는 경우
- recommend: 분위기/장르/카테고리/난이도 등으로 노래를 추천받고 싶은 경우. 인기곡, 유행곡, SNS 화제곡, 쉬운 곡, 어려운 곡 요청도 포함
- unknown: 노래 검색과 완전히 무관한 경우

응답 형식 (JSON만, 다른 텍스트 금지):
{
  "intent": "search_song" | "search_artist" | "recommend" | "unknown",
  "keyword": "곡명 또는 가수명 (search_song, search_artist일 때만)",
  "vibe": "분위기 (recommend일 때만, 예: 신나는, 잔잔한, 슬픈)",
  "genre": "장르 (recommend일 때만, 예: 시티팝, 록, 애니송)",
  "category": "출처 (recommend일 때만. 반드시 아래 5개 중 하나만: 애니메이션 OST, 극장판 OST, 게임 OST, 보컬로이드, J-POP)",
  "trait": "차트 특성 (recommend일 때만. 반드시 아래 5개 중 하나만: 역주행, 바이럴, 최신곡, 예전곡, 커버곡)",
  "vocal_difficulty": "보컬 난이도 (recommend일 때만. easy 또는 hard)",
  "pronunciation_difficulty": "발음 난이도 (recommend일 때만. easy 또는 hard)"
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

vocal_difficulty 분류 기준:
- "쉬운", "초보", "입문", "누구나 부를 수 있는" → "easy"
- "어려운", "고난이도", "실력자용" → "hard"

pronunciation_difficulty 분류 기준:
- "발음 쉬운", "일본어 발음 쉬운" → "easy"
- "발음 어려운", "일본어 발음 어려운" → "hard"

규칙:
- keyword는 일본어/영어/한국어 모두 허용, 원문 우선
- 해당 없는 필드는 아예 생략
- 특정 보컬로이드/UTAU 캐릭터 이름이 명시된 경우 → search_artist, keyword: 캐릭터명 원문
- "미쿠 노래", "하츠네 미쿠 곡", "카사네 테토 찾아줘" → search_artist, keyword: "初音ミク" / "重音テト"
- 특정 캐릭터명 없이 "보컬로이드 추천", "미쿠 같은 노래" → recommend + category: "보컬로이드"
- "요아소비 최신곡", "아도 노래" → search_artist, keyword: "YOASOBI" / "Ado"
- "신나는 노래", "인기곡", "요즘 유행하는 노래", "SNS에서 뜨는 곡" → recommend, vibe 또는 trait 추출
- "애니 OST 추천", "게임 BGM" → recommend + category 추출
- "미쿠 노래", "하츠네 미쿠 곡", "카사네 테토 찾아줘" → search_artist, keyword: 원문 캐릭터명
- "보컬로이드 노래 틀어줘", "미쿠 같은 분위기" → recommend + category: "보컬로이드"
- "쉬운 곡 추천", "초보용 노래" → recommend + vocal_difficulty: "easy"
- "발음 쉬운 애니송" → recommend + pronunciation_difficulty: "easy" + category: "애니메이션 OST"
- "어려운 곡 추천해줘" → recommend + vocal_difficulty: "hard"
- "~말고", "~빼고", "~제외하고" 가 포함된 경우, 해당 단어는 keyword가 아닌 제외 조건임
- "어려운 곡 추천해줘 모니터링 말고" → recommend + vocal_difficulty: "hard" (모니터링은 무시)
- 부정어가 붙은 단어는 절대 keyword로 추출하지 말 것
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
  try {
    const result = await getIntentModel().generateContent(userInput);
    const parsed = JSON.parse(result.response.text());

    const validIntents = [
      "search_song",
      "search_artist",
      "recommend",
      "unknown",
    ];
    if (!parsed.intent || !validIntents.includes(parsed.intent)) {
      return { intent: "unknown" };
    }

    if (
      (parsed.intent === "search_song" || parsed.intent === "search_artist") &&
      !parsed.keyword
    ) {
      return { intent: "unknown" };
    }

    return parsed as ChatIntent;
  } catch (e) {
    // 429는 route.ts catch 블록으로 올려서 전용 메시지 처리
    if (
      e !== null &&
      typeof e === "object" &&
      (("status" in e && e.status === 429) ||
        ("response" in e &&
          typeof e.response === "object" &&
          e.response !== null &&
          "status" in e.response &&
          (e.response as { status: number }).status === 429))
    ) {
      throw e;
    }
    return { intent: "unknown" };
  }
}
