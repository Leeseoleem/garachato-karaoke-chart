import { Compass } from "lucide-react";
import IconButton from "./IconButton";
import type { Size } from "./IconButton";

interface ExploreButtonProps {
  size?: Size;
  onClick: () => void;
}

export default function ExploreButton({
  size = "large",
  onClick,
}: ExploreButtonProps) {
  return (
    <IconButton
      size={size}
      icon={<Compass size={20} color="#ffffff" />}
      onClick={onClick}
      ariaLabel="탐색"
    />
  );
}
