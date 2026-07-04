interface DetailSectionProps {
  label: string;
  children: React.ReactNode;
}

export default function DetailSection({ label, children }: DetailSectionProps) {
  return (
    <section className="flex flex-col gap-3 py-6">
      <p className="typo-label text-content-secondary">{label}</p>
      {children}
    </section>
  );
}
