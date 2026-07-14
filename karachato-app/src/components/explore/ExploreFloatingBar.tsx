"use client";
import { motion, AnimatePresence } from "framer-motion";
import { House } from "lucide-react";
import IconButton from "@/components/common/buttons/IconButton";
import ScrollToTopButton from "@/components/common/buttons/ScrollToTopButton";

interface ExploreFloatingBarProps {
  isScrolled: boolean;
  onScrollToTop: () => void;
  onHome: () => void;
}

// 탐색 홈 전용 플로팅바. 차트(홈)로 이동 + 스크롤 시 맨 위로.
export default function ExploreFloatingBar({
  isScrolled,
  onScrollToTop,
  onHome,
}: ExploreFloatingBarProps) {
  return (
    <div className="fixed bottom-[calc(1.5rem+var(--safe-bottom,0px))] left-1/2 -translate-x-1/2 z-40">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex flex-row w-fit gap-1 p-1 rounded-full glass-static"
      >
        <IconButton
          size="large"
          icon={<House size={20} color="#ffffff" />}
          onClick={onHome}
          ariaLabel="차트로"
        />
        <AnimatePresence mode="popLayout">
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
            >
              <ScrollToTopButton onClick={onScrollToTop} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
