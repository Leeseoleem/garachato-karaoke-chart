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
      className="relative flex w-fit h-13 cursor-pointer items-center rounded-full p-0.5 glass-static select-none"
    >
      {/* 왼쪽 슬롯 */}
      <div className="relative flex x-fit h-full flex-row items-center justify-center gap-2 px-5">
        {displayMode === "translated" && (
          <motion.div
            layoutId="pill"
            className="glass-active absolute inset-0 rounded-full flex flex-row items-center justify-center gap-2 px-5"
            animate={{ opacity: 1, filter: "saturate(1)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Languages size={20} color="#ffffff" />
            <p className="typo-caption text-gray-white">번역</p>
          </motion.div>
        )}
        <Languages size={20} color="transparent" />
        <span className="text-transparent">원문</span>
      </div>

      {/* 오른쪽 슬롯 */}
      <div className="relative flex x-fit h-full flex-row items-center justify-center gap-2 px-5">
        {displayMode === "original" && (
          <motion.div
            layoutId="pill"
            className="glass-active absolute inset-0 rounded-full flex flex-row items-center justify-center gap-2 px-5"
            animate={{ opacity: 0.45, filter: "saturate(0.2)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Languages size={20} color="#ffffff" />
            <p className="typo-caption text-gray-white">번역</p>
          </motion.div>
        )}
        <Languages size={20} color="transparent" />
        <span className="text-transparent">원문</span>
      </div>
    </div>
  );
}
