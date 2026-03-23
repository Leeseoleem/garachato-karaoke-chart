import clsx from "clsx";

interface DividerProps {
  className?: string;
}

export default function Divider({ className = "bg-gray-30" }: DividerProps) {
  return <div className={clsx("w-full h-px", className)} />;
}
