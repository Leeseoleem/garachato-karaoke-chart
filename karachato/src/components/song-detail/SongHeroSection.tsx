import Image from "next/image";
import { Music2 } from "lucide-react";

interface SongHeroSectionProps {
  titleKo: string;
  titleInProvider: string; // 원문 제목 (일본어)
  artistKo: string | null;
  artistInProvider: string; // 원문 가수명
  thumbnailUrl: string | null;
  youtubeVideoId: string | null;
}

export default function SongHeroSection({
  titleKo,
  titleInProvider,
  artistKo,
  artistInProvider,
  thumbnailUrl,
  youtubeVideoId,
}: SongHeroSectionProps) {
  const youtubeUrl = youtubeVideoId
    ? `https://www.youtube.com/watch?v=${youtubeVideoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${titleInProvider} ${artistInProvider}`)}`;
  return (
    <div className="flex flex-col gap-6 items-start">
      <div className="flex flex-col gap-6 items-start">
        {/* 노래 제목 */}
        <div className="flex flex-col gap-2 items-start">
          <h1 className="typo-title-01 text-gray-white">{titleKo}</h1>
          <h5 className="typo-body text-content-secondary">
            {titleInProvider}
          </h5>
        </div>
        {/* 가수 이름 */}
        <div className="flex flex-row gap-4 items-center">
          <div className="flex justify-center items-center w-8 h-8 glass-active">
            <Music2 size={16} color="#ffffff" />
          </div>
          <div>
            <h3 className="typo-title-02 text-content-primary">
              {artistInProvider}
            </h3>
            {artistKo && (
              <h5 className="typo-body text-content-secondary">{artistKo}</h5>
            )}
          </div>
        </div>
      </div>
      {/* 썸네일 */}
      <a
        type="button"
        aria-label={`${titleKo} 유튜브에서 보기`}
        target="_blank"
        rel="noopener noreferrer"
        href={youtubeUrl}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-secondary"
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={titleKo}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-20">
            <p className="typo-caption text-gray-10">
              영상을 가져오지 못했습니다
            </p>
          </div>
        )}
      </a>
    </div>
  );
}
