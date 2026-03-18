import clsx from "clsx";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export default function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={clsx(
        "flex flex-row w-full min-h-16 px-4 items-center",
        className,
      )}
    >
      {children}
    </header>
  );
}
