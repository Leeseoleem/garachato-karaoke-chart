"use client";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import SearchSection from "@/components/search/SearchSection";
import ChatModal from "@/components/modals/ChatModal";
import ExploreFloatingBar from "./ExploreFloatingBar";
import { useScrollTop } from "@/hooks/useScrollTop";

// 탐색 홈 쉘: 검색 헤더 공유 + 스크롤 + 홈 이동 플로팅바. (서버에서 받은 섹션을 children으로 감쌈)
export default function ExploreHomeShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { scrollRef, isScrolled } = useScrollTop();
  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden">
      <SearchSection />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-[calc(6rem+var(--safe-bottom,0px))]"
      >
        {children}
      </div>
      <ExploreFloatingBar
        isScrolled={isScrolled}
        onScrollToTop={() =>
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
        onHome={() => router.push("/")}
      />
      <ChatModal />
    </div>
  );
}
