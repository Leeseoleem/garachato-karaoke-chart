"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-6 py-3 rounded-xl rounded-bl-sm bg-gray-20 w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-brand-main block"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 1.0,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut" as const,
          }}
        />
      ))}
    </div>
  );
}
