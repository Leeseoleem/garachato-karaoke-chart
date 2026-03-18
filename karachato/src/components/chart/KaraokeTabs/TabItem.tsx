import { motion } from "framer-motion";
import clsx from "clsx";

export type Position = "left" | "middle" | "right";

interface TabItemProps {
  label: string;
  position?: Position;
  isActive?: boolean;
  onClick?: () => void;
}

const radiusMap: Record<Position, string> = {
  left: "rounded-tr-full",
  middle: "rounded-t-full",
  right: "rounded-tl-full",
};

export default function TabItem({
  label,
  position = "left",
  isActive = false,
  onClick,
}: TabItemProps) {
  return (
    <motion.button
      type="button"
      className={clsx(
        "flex flex-1 h-full justify-center items-center",
        isActive && clsx("bg-brand-dark", radiusMap[position]),
      )}
      onClick={onClick}
      animate={{
        y: isActive ? 0.5 : 6,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <span
        className={
          isActive
            ? "typo-subtitle text-gray-white"
            : "typo-body text-content-secondary"
        }
      >
        {label}
      </span>
    </motion.button>
  );
}
