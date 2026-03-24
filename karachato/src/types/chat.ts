import type { KaraokeProvider } from "./domain";

export type MessageRole = "user" | "model";

// ────────────────────────────────────────
// 메시지 타입 인터페이스
// ────────────────────────────────────────

export interface TextMessage {
  type: "text";
  role: MessageRole;
  // 유저 입력 또는 AI 일반 응답 말풍선
  // role: "user" → 유저가 입력한 메시지
  // role: "model" → intent: "chat" 응답 (추가 질문, 안내 등)
  message: string;
}

export interface SongCandidateMessage {
  type: "song_candidate";
  role: "model";
  // DB에서 곡을 찾았을 때 — SongCard + "맞아요 / 아니에요" 버튼 렌더링
  // 유저가 "맞아요" → ConfirmedMessage / "아니에요" → TextMessage로 재질문 유도
  song_id: string;
  message: string;
  song: {
    songId: string;
    titleKo: string | null;
    artistKo: string | null;
    titleInProvider: string;
    artistInProvider: string;
    karaokeTracks: { provider: KaraokeProvider; karaokeNo: string }[];
    isInTop100: boolean;
  };
}

export interface ConfirmedMessage {
  type: "confirmed";
  role: "model";
  // 유저가 "맞아요"를 눌러 곡이 확정된 상태
  // 마무리 멘트 + "새 채팅 시작하기" 버튼 렌더링 + isEnded: true로 입력창 잠금
  song_id: string;
  message: string;
}

export interface OffTopicMessage {
  type: "off_topic";
  role: "model";
  // Gemini가 intent: "off_topic"으로 분류한 경우
  // 노래와 무관한 질문 → 안내 문구만 표시, 입력창은 유지
  message: string;
}

export interface ErrorMessage {
  type: "error";
  role: "model";
  // API 호출 실패 또는 예외 발생 시
  // fetch catch 블록 또는 서버 500 응답에서 클라이언트가 직접 생성
  message: string;
}

// ────────────────────────────────────────
// 유니온 + 파생 타입
// ────────────────────────────────────────

export type ChatMessage =
  | TextMessage
  | SongCandidateMessage
  | ConfirmedMessage
  | OffTopicMessage
  | ErrorMessage;

// ChatMessage에서 자동 추출 — 인터페이스 추가 시 자동 반영
export type ChatMessageType = ChatMessage["type"];

// ────────────────────────────────────────
// UI 상태 (messages 배열 외부 관리)
// ────────────────────────────────────────

export interface ChatUIState {
  isLoading: boolean; // TypingIndicator 표시
  isEnded: boolean; // confirmed 후 입력창 잠금
}
