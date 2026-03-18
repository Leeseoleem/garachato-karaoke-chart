"use client";
import { AudioLines } from "lucide-react";
// === component ===
import IconButton from "./IconButton";
// === store ===
import { useChatStore } from "@/store/chatStore";

export default function ChatButton() {
  const setIsChatOpen = useChatStore((state) => state.setIsChatOpen);
  return (
    <IconButton
      onClick={() => setIsChatOpen(true)}
      ariaLabel="AI 챗봇 열기"
      icon={<AudioLines size={20} color="#ffffff" />}
    />
  );
}
