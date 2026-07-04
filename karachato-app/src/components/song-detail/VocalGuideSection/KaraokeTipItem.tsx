interface KaraokeTipItemProps {
  tip: string;
}

export default function KaraokeTipItem({ tip }: KaraokeTipItemProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <p className="typo-caption text-brand-light">🎤 노래 팁</p>
      <p className="typo-body text-content-primary whitespace-pre-line wrap-break-word">
        {tip}
      </p>
    </div>
  );
}
