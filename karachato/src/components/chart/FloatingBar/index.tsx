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
  onScrollToTop: () => void;
}

export default function FloatingBar({
  isScrolled,
  onScrollToTop,
}: FloatingBarProps) {
  const { setIsSettingsOpen } = useChartStore();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 ">
      <motion.div
        layout
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
    </div>
  );
}
