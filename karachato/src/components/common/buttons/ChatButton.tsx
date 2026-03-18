"use client";
import { useRouter } from "next/navigation";
import { AudioLines } from "lucide-react";
// === component ===
import IconButton from "./IconButton";
// === constant ===
import { ROUTES } from "@/constants/routes";

export default function ChatButton() {
  const router = useRouter();
  return (
    <IconButton
      onClick={() => router.push(ROUTES.CHAT)}
      ariaLabel="AI 챗봇 열기"
      icon={<AudioLines size={20} color="#ffffff" />}
    />
  );
}
