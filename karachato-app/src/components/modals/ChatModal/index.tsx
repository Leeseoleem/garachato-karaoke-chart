"use client";
import { useState, useRef, useEffect } from "react";
// === component ===
import { ModalSheet } from "../ModalSheet";
import { TextBubble } from "./TextBubble";
import SongCard from "./SongCard";
import ChatActionButton from "./ChatActionButton";
import QuickQuestions from "./QuickQuestions";
import TypingIndicator from "./TypingIndicator";
import UserInput from "./UserInput";
// === type ===
import type { ChatMessage, ChatTurn } from "@/types/chat";
// === constant ===
import { CHAT_WELCOME_MESSAGE } from "@/constants/chat";
// === lib ===
import { apiUrl } from "@/lib/api";
// === store ===
import { useChatStore } from "@/store/chatStore";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    type: "text",
    role: "model",
    message: CHAT_WELCOME_MESSAGE,
  },
];

// 대화 맥락 전달용: messages를 최근 N턴 요약 turn으로 직렬화 (봇의 곡 카드는 텍스트로 요약).
const HISTORY_LIMIT = 8;
function buildHistory(messages: ChatMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const m of messages) {
    if (m.type === "text") {
      turns.push({ role: m.role, text: m.message });
    } else if (m.type === "off_topic") {
      turns.push({ role: "model", text: m.message });
    } else if (m.type === "song_candidate") {
      const title = m.song.titleKo ?? m.song.titleInProvider;
      const artist = m.song.artistKo ?? m.song.artistInProvider;
      turns.push({ role: "model", text: `추천곡: '${title}' - ${artist}` });
    } else if (m.type === "confirmed") {
      turns.push({ role: "model", text: "사용자가 곡을 확정함" });
    }
    // error 메시지는 맥락에서 제외
  }
  return turns.slice(-HISTORY_LIMIT);
}

// 이미 보여준(제안/확정한) 곡 id 수집 → 서버에 전달해 "다른 거" 시 제외
function buildExcludeIds(messages: ChatMessage[]): string[] {
  const ids = new Set<string>();
  for (const m of messages) {
    if (m.type === "song_candidate") ids.add(m.song.songId);
    else if (m.type === "confirmed") ids.add(m.song_id);
  }
  return [...ids];
}

export default function ChatModal({
  initialMessages = INITIAL_MESSAGES,
}: {
  /** @storybook 전용 — 프로덕션에서 사용하지 않음 */
  initialMessages?: ChatMessage[];
}) {
  const { isChatOpen, setIsChatOpen } = useChatStore();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages(initialMessages);
    setIsEnded(false);
    setIsLoading(false);
    setInputValue("");
  };

  const handleClose = () => {
    handleReset();
    setIsChatOpen(false);
  };

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading || isEnded) return;

    setMessages((prev) => [
      ...prev,
      { type: "text", role: "user", message: input },
    ]);
    setInputValue("");
    setIsLoading(true);

    // 이전 요청이 남아 있으면 취소하고 새 컨트롤러 준비 (닫기/리셋/연속전송 시 늦은 응답 방지)
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: buildHistory(messages),
          excludeIds: buildExcludeIds(messages),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessages((prev) => [...prev, errorData as ChatMessage]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data as ChatMessage]);
    } catch {
      // 취소된 요청은 조용히 무시 (사용자가 닫거나 리셋함)
      if (controller.signal.aborted) return;
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          role: "model",
          message: "서버 오류가 발생했어요. 다시 시도해주세요.",
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isEnded) {
      inputRef.current?.focus();
    }
  }, [isLoading, isEnded]);

  return (
    <ModalSheet
      isOpen={isChatOpen}
      onClose={handleClose}
      headerLabel="찾고 싶은 곡이 있으신가요?"
    >
      <div className="flex flex-col h-full" style={{ maxHeight: "70dvh" }}>
        {/* 메시지 리스트 */}
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 p-5">
          {messages.map((msg, idx) => {
            /** 기본 채팅 */
            if (msg.type === "text") {
              return (
                <TextBubble key={idx} role={msg.role} content={msg.message} />
              );
            }
            /** 응답 채팅 */
            if (msg.type === "song_candidate") {
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <TextBubble role="model" content={msg.message} />
                  <SongCard {...msg.song} />
                  <div className="flex gap-2 items-center">
                    <ChatActionButton
                      variant="primary"
                      onClick={() => {
                        if (isEnded || isLoading) return;
                        setMessages((prev) => [
                          ...prev,
                          {
                            type: "confirmed",
                            role: "model",
                            song_id: msg.song.songId,
                            message: "찾으셨군요! 즐거운 시간 되세요 🎤",
                          },
                        ]);
                        setIsEnded(true);
                      }}
                    />
                    <ChatActionButton
                      variant="secondary"
                      onClick={() => {
                        if (isEnded || isLoading) return;
                        setMessages((prev) => [
                          ...prev,
                          {
                            type: "text",
                            role: "model",
                            message:
                              "앗, 다시 찾아볼게요! 찾으시는 곡에 대해 더 알려주시겠어요?",
                          },
                        ]);
                      }}
                    />
                  </div>
                </div>
              );
            }
            /** 챗봇 완료 채팅 */
            if (msg.type === "confirmed") {
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <TextBubble role="model" content={msg.message} />
                  <ChatActionButton variant="new" onClick={handleReset} />
                </div>
              );
            }
            /** 맥락 이탈 / 에러 */
            if (msg.type === "off_topic") {
              return (
                <TextBubble key={idx} role="model" content={msg.message} />
              );
            }

            if (msg.type === "error") {
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <TextBubble role="model" content={msg.message} />
                  <ChatActionButton variant="retry" onClick={handleReset} />
                </div>
              );
            }
          })}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* 퀵 질문 — 웰컴 메시지만 있을 때 표시 */}
        {messages.length === 1 && <QuickQuestions onSelect={handleSend} />}

        {/* 입력창 */}
        <UserInput
          maxLength={200}
          ref={inputRef}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSend(inputValue)}
          disabled={isLoading || isEnded}
        />
      </div>
    </ModalSheet>
  );
}
