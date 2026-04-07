const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function highlight(text: string, query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return <span>{text}</span>;

  const escapedQuery = escapeRegExp(normalizedQuery);
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-brand-dark text-brand-light rounded-sm">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
