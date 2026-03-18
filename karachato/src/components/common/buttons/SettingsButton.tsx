import { Settings } from "lucide-react";
import IconButton from "./IconButton";
import type { Size } from "./IconButton";

interface SettingsButtonProps {
  size?: Size;
  onClick: () => void;
}

export default function SettingsButton({
  size = "large",
  onClick,
}: SettingsButtonProps) {
  return (
    <IconButton
      size={size}
      icon={<Settings size={20} color="#ffffff" />}
      onClick={onClick}
      ariaLabel="설정"
    />
  );
}
