"use client";
import { useState } from "react";
// === component ===
import { ModalSheet } from "../ModalSheet";
import { TextBubble } from "./TextBubble";
import SongCard from "./SongCard";
import ChatActionButton from "./ChatActionButton";
import QuickQuestions from "./QuickQuestions";
import TypingIndicator from "./TypingIndicator";
import UserInput from "./UserInput";
// === type ===
import type { ChatMessage } from "@/types/chat";
// === constant ===
import { CHAT_WELCOME_MESSAGE } from "@/constants/chat";
// === store ===
import { useChatStore } from "@/store/chatStore";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    type: "text",
    role: "model",
    message: CHAT_WELCOME_MESSAGE,
  },
];

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

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setIsEnded(false);
    setIsLoading(false);
    setInputValue("");
  };

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading || isEnded) return;

    setMessages((prev) => [
      ...prev,
      { type: "text", role: "user", message: input },
    ]);
    setInputValue("");

    // TODO: fetch /api/chat 연결 전까지 isLoading 사용 안 함
    // setIsLoading(true);
  };

  return (
    <ModalSheet
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
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
            if (msg.type === "off_topic" || msg.type === "error") {
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <TextBubble key={idx} role="model" content={msg.message} />
                  <ChatActionButton variant="retry" onClick={handleReset} />
                </div>
              );
            }
          })}

          {isLoading && <TypingIndicator />}
        </div>

        {/* 퀵 질문 — 웰컴 메시지만 있을 때 표시 */}
        {messages.length === 1 && <QuickQuestions onSelect={handleSend} />}

        {/* 입력창 */}
        <UserInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSend(inputValue)}
          disabled={isLoading || isEnded}
        />
      </div>
    </ModalSheet>
  );
}
