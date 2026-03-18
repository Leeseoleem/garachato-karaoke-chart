import { ChevronUp } from "lucide-react";

// === component ===
import IconButton from "./IconButton";

// === type ===
import type { Size } from "./IconButton";

interface ScrollToTopButtonProps {
  size?: Size;
  onClick: () => void;
}

export default function ScrollToTopButton({
  size = "large",
  onClick,
}: ScrollToTopButtonProps) {
  return (
    <IconButton
      size={size}
      icon={<ChevronUp size={20} color="#ffffff" />}
      onClick={onClick}
      ariaLabel="맨 위로 이동"
    />
  );
}
