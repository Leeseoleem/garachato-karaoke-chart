"use client";
import { motion, AnimatePresence } from "framer-motion";

// === component ===
import DisplayModeToggle from "./DisplayModeToggle";
import SettingsButton from "@/components/common/buttons/SettingsButton";
import ScrollToTopButton from "@/components/common/buttons/ScrollToTopButton";

// === function ===
import { useChartStore } from "@/store/chartStore";

interface FloatingBarProps {
  isScrolled: boolean;
  isVisible: boolean;
  onScrollToTop: () => void;
}

// 주의: 바깥 `fixed` div는 transform 걸린 조상이 없어야 뷰포트 기준으로 하단에 고정됨.
// (등장/퇴장 애니메이션은 안쪽 motion.div에서 처리 — fixed 요소의 "자손" transform은 무해)
export default function FloatingBar({
  isScrolled,
  isVisible,
  onScrollToTop,
}: FloatingBarProps) {
  const { setIsSettingsOpen } = useChartStore();
  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex flex-row w-fit gap-1 p-1 rounded-full glass-static"
          >
            <DisplayModeToggle />
            <SettingsButton onClick={() => setIsSettingsOpen(true)} />
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
        )}
      </AnimatePresence>
    </div>
  );
}
