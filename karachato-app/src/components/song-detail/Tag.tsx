export default function Tag({ label }: { label: string }) {
  const textClass = "typo-label text-gray-10";
  return (
    <div className="flex flex-row gap-1 items-center">
      <p className={textClass}>#</p>
      <p className={textClass}>{label}</p>
    </div>
  );
}
