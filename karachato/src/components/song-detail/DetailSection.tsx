interface DetailSectionProps {
  label: string;
  children: React.ReactNode;
}

export default function DetailSection({ label, children }: DetailSectionProps) {
  return (
    <section className="flex flex-col p-4 gap-3">
      <p className="typo-label text-content-secondary">{label}</p>
      {children}
    </section>
  );
}
