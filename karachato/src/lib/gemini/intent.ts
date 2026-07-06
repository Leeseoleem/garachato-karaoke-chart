import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatIntent } from "@/types/gemini";
import type { ChatTurn } from "@/types/chat";

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
- "최신곡", "신곡", "새로 나온", "최근 나온", "요즘 나온", "인기곡", "요즘 뜨는", "핫한" → "최신곡"
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
- keyword 표기 정규화 (중요): keyword는 그 곡/가수가 **실제 발매·표기된 원어**로 변환해 출력한다.
  한글 음차(발음만 한글로 옮긴 것)로 들어와도 원어로 되돌린다. DB엔 원어(일본어/로마자)와 한국어 번역만 있고 한글 음차는 없기 때문이다.
  - 로마자로 발매된 제목/가수 → 알파벳: "피피피피"→"PPPP", "에이도"→"Ado", "원오크락"→"ONE OK ROCK", "요아소비"→"YOASOBI"
  - 일본어로 발매된 제목/가수 → 일본어: "요루시카"→"ヨルシカ", "요네즈 켄시"→"米津玄師", "요루니카케루"→"夜に駆ける"
  - 이미 흔히 쓰이는 한국어 번역 제목이면 그대로 둔다: "밤에 달리다"→"밤에 달리다"
  - 원어 표기가 불확실하면 가장 널리 쓰이는 공식 표기를 택한다.
- keyword는 일본어/영어/한국어 모두 허용, 원문 우선
- 해당 없는 필드는 아예 생략
- 특정 보컬로이드/UTAU 캐릭터 이름이 명시된 경우 → search_artist, keyword: 캐릭터명 원문
- "미쿠 노래", "하츠네 미쿠 곡", "카사네 테토 찾아줘" → search_artist, keyword: "初音ミク" / "重音テト"
- 특정 캐릭터명 없이 "보컬로이드 추천", "미쿠 같은 노래" → recommend + category: "보컬로이드"
- "요아소비 최신곡", "아도 노래" → search_artist, keyword: "YOASOBI" / "Ado"
- 여러 가수를 함께 언급하면(협업/피처링 포함, 예: "미쿠 테토", "아이묭이랑 요네즈", "미쿠 카사네테토 곡") → search_artist. keyword에 각 가수를 **쉼표(,)로 구분해** 원문 표기로 나열. 예: "初音ミク, 重音テト" / "あいみょん, 米津玄師"
- "신나는 노래", "인기곡", "요즘 유행하는 노래", "SNS에서 뜨는 곡" → recommend, vibe 또는 trait 추출
- "애니 OST 추천", "게임 BGM" → recommend + category 추출
- 특정 보컬로이드/UTAU 캐릭터의 곡 자체를 찾는 경우 ("미쿠 노래", "하츠네 미쿠 곡", "카사네 테토 찾아줘") → search_artist, keyword: 캐릭터명 원문
- 특정 캐릭터를 기준으로 비슷한 곡/분위기를 찾는 경우 ("미쿠 같은 노래", "미쿠 같은 분위기") → recommend + category: "보컬로이드"
- 캐릭터명이 없는 "보컬로이드 추천", "보컬로이드 노래 틀어줘"도 → recommend + category: "보컬로이드"
- "쉬운 곡 추천", "초보용 노래" → recommend + vocal_difficulty: "easy"
- "발음 쉬운 애니송" → recommend + pronunciation_difficulty: "easy" + category: "애니메이션 OST"
- "어려운 곡 추천해줘" → recommend + vocal_difficulty: "hard"
- "~말고", "~빼고", "~제외하고" 가 포함된 경우, 해당 단어는 keyword가 아닌 제외 조건임
- "어려운 곡 추천해줘 모니터링 말고" → recommend + vocal_difficulty: "hard" (모니터링은 무시)
- 부정어가 붙은 단어는 절대 keyword로 추출하지 말 것

맥락 규칙 (이전 대화가 함께 주어질 때):
- 입력 앞에 "[이전 대화]" 블록이 있으면, "[현재 메시지]"가 그 맥락을 참조할 수 있다.
- "다른 거", "다른 곡", "또", "그거 말고", "딴 거" 등 = 직전에 다룬 가수/조건을 유지한 채 다른 곡을 원하는 것:
  - 직전 맥락이 특정 가수였다면 → search_artist, keyword: 그 가수(원문 표기).
  - 직전 맥락이 recommend 조건(분위기/장르/카테고리 등)이었다면 → 같은 조건으로 recommend.
- "좀 더 잔잔한/신나는/쉬운" 등은 직전 조건을 이어받아 recommend로 분류.
- 단, 현재 메시지가 새로운 가수/곡/조건을 명시하면 이전 맥락보다 그것을 우선한다.
- JSON 외 텍스트 절대 출력 금지
`.trim();

// 인텐트 추출 모델(폴백 순서). 앞 모델이 과부하(503)·쿼터(429) 등으로 실패하면 다음 모델로.
// flash-lite가 자주 과부하나서 flash를 예비로 둠.
const INTENT_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-latest",
] as const;

const modelCache = new Map<
  string,
  ReturnType<GoogleGenerativeAI["getGenerativeModel"]>
>();

function getIntentModel(modelName: string) {
  let model = modelCache.get(modelName);
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
    model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { responseMimeType: "application/json" },
    });
    modelCache.set(modelName, model);
  }
  return model;
}

function parseIntent(text: string): ChatIntent {
  const parsed = JSON.parse(text);

  const validIntents = ["search_song", "search_artist", "recommend", "unknown"];
  if (!parsed.intent || !validIntents.includes(parsed.intent)) {
    return { intent: "unknown" };
  }

  if (parsed.intent === "search_song" || parsed.intent === "search_artist") {
    const keyword =
      typeof parsed.keyword === "string" ? parsed.keyword.trim() : "";
    if (!keyword) return { intent: "unknown" };
    parsed.keyword = keyword;
  }

  return parsed as ChatIntent;
}

// 이전 대화(history)를 프롬프트 앞에 붙여 맥락 참조("다른 거" 등)를 가능하게 함.
function buildContextualInput(userInput: string, history?: ChatTurn[]): string {
  if (!history || history.length === 0) return userInput;
  const convo = history
    .map((t) => `${t.role === "user" ? "사용자" : "봇"}: ${t.text}`)
    .join("\n");
  return `[이전 대화]\n${convo}\n\n[현재 메시지]\n${userInput}`;
}

export async function extractIntent(
  userInput: string,
  history?: ChatTurn[],
): Promise<ChatIntent> {
  const input = buildContextualInput(userInput, history);
  let lastError: unknown;
  let sawUnknown = false;

  // 모델 순회(flash-lite→flash→flash-latest, 뒤로 갈수록 안정적):
  // - 예외(429/503 등) → 다음 모델로 폴백.
  // - 확신 있는 분류(non-unknown)면 즉시 채택.
  // - unknown은 약한 모델의 오분류일 수 있어 다음(더 강한) 모델로 재확인.
  //   ("요네즈 켄시 노래 찾아줘"를 flash-lite가 간헐적으로 unknown 처리하던 버그 보정.)
  for (const modelName of INTENT_MODELS) {
    try {
      const result = await getIntentModel(modelName).generateContent(input);
      const intent = parseIntent(result.response.text());
      if (intent.intent !== "unknown") return intent;
      sawUnknown = true;
    } catch (e) {
      lastError = e;
    }
  }

  // 응답한 모델이 모두 unknown → 진짜 무관. 아무도 응답 못함(전부 에러) → 에러 전파
  // (503/429를 "물어봐 주세요"로 숨기지 않고 route.ts가 전용 메시지+재시도로 처리).
  if (sawUnknown) return { intent: "unknown" };
  throw lastError;
}
