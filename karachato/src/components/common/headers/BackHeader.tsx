// === component ===
import Header from "./Header";
import BackButton from "./BackButton";

interface BackHeaderProps {
  title?: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  return (
    <Header>
      <div className="flex flex-row items-center gap-4">
        <BackButton />
        {title && <p className="typo-label text-brand-light">{title}</p>}
      </div>
    </Header>
  );
}
