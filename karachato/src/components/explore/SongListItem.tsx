import Link from "next/link";
import Image from "next/image";
import { Music2 } from "lucide-react";
import KaraokeBadge from "@/components/common/badges/KaraokeBadge";
import type { ExploreSong } from "@/lib/explore/queries";

// 드릴다운(카테고리·가수) 리치 리스트 아이템: 썸네일 + 제목/가수 + 설명 + 노래방 번호.
export default function SongListItem({ song }: { song: ExploreSong }) {
  return (
    <Link
      href={`/song/${song.songId}`}
      className="flex gap-3 border-b border-gray-30 px-5 py-4 transition-colors active:bg-gray-40"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-20">
        {song.thumbnailUrl ? (
          <Image
            src={song.thumbnailUrl}
            alt={song.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2 size={20} className="text-gray-10" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="typo-subtitle truncate text-gray-white">{song.title}</p>
        <p className="typo-caption truncate text-content-secondary">
          {song.artist}
        </p>
        {song.description && (
          <p className="typo-caption line-clamp-2 text-content-secondary">
            {song.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-2">
          {song.tracks.map((t) => (
            <div key={t.provider} className="flex items-center gap-1.5">
              <KaraokeBadge provider={t.provider} />
              <span className="typo-caption text-content-primary">
                {t.karaokeNo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
