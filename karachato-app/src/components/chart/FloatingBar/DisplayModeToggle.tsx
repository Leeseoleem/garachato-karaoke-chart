"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useChartStore } from "@/store/chartStore";

export default function DisplayModeToggle() {
  const { displayMode, setDisplayMode } = useChartStore();

  const toggle = () => {
    setDisplayMode(displayMode === "translated" ? "original" : "translated");
  };

  return (
    <div
      onClick={toggle}
      role="switch"
      aria-checked={displayMode === "translated"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className="relative flex h-[52px] cursor-pointer items-center rounded-full p-0.5 glass-static select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      {/* 왼쪽 슬롯 */}
      <div className="relative flex flex-row items-center justify-center w-13 h-13">
        {displayMode === "translated" && (
          <motion.div
            layoutId="pill"
            className="glass-active absolute inset-0 rounded-full flex flex-row items-center justify-center w-13 h-13"
            animate={{ opacity: 1, filter: "saturate(1)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Languages size={20} color="#ffffff" />
          </motion.div>
        )}
        <Languages size={20} color="transparent" />
      </div>

      {/* 오른쪽 슬롯 */}
      <div className="relative flex flex-row items-center justify-center w-13 h-13">
        {displayMode === "original" && (
          <motion.div
            layoutId="pill"
            className="glass-active absolute inset-0 rounded-full flex flex-row items-center justify-center w-13 h-13"
            animate={{ opacity: 0.45, filter: "saturate(0.2)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Languages size={20} color="#ffffff" />
          </motion.div>
        )}
        <Languages size={20} color="transparent" />
      </div>
    </div>
  );
}
