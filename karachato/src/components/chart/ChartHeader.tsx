import clsx from "clsx";

export default function ChartHeader() {
  const textClass = "typo-caption text-content-secondary";
  return (
    <div>
      <div
        className={clsx(
          "flex flex-row justify-between items-center w-full px-5 py-3",
        )}
      >
        <div className="flex flex-row gap-5 items-center justify-center">
          <p className={textClass}>순위</p>
          <p className={textClass}>제목</p>
        </div>
        <p className={textClass}>노래방 번호</p>
      </div>

      <div className="bg-linear-to-br from-brand-light to-brand-accent p-[0.5px] rounded-lg" />
    </div>
  );
}
