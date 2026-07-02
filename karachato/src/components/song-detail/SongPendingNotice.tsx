import { Hourglass, Music2 } from "lucide-react";

type Props = {
  titleOriginal: string;
  artistOriginal: string;
};

export default function SongPendingNotice({
  titleOriginal,
  artistOriginal,
}: Props) {
  return (
    <div className="flex flex-1 flex-col px-5 py-3">
      {/* 제목 / 가수 — 상세 페이지와 동일한 위치 */}
      <div className="flex flex-col gap-6 items-start">
        <h1 className="typo-title-01 text-gray-white">{titleOriginal}</h1>
        <div className="flex flex-row gap-4 items-center">
          <div className="flex justify-center items-center w-8 h-8 glass-active">
            <Music2 size={16} color="#ffffff" />
          </div>
          <h3 className="typo-title-02 text-content-primary">
            {artistOriginal}
          </h3>
        </div>
      </div>

      {/* 남는 영역 중앙 — 검색 빈 상태와 동일한 아이콘 + 라벨 형식 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Hourglass size={80} className="text-gray-10" strokeWidth={1.2} />
        <div className="flex flex-col text-center gap-1">
          <p className="typo-title text-content-primary">
            곡 정보를 준비하고 있어요.
          </p>
          <p className="typo-caption text-content-secondary">곧 만나요!</p>
        </div>
      </div>
    </div>
  );
}
