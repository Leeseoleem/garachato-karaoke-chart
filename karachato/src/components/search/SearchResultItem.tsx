import Link from "next/link";
import KaraokeBadge from "../common/badges/KaraokeBadge";
import type { KaraokeProvider } from "@/types/domain";

interface KaraokeTrack {
  provider: KaraokeProvider;
  karaokeNo?: string; // karaoke_tracks.karaoke_no
}

interface SearchResultItemProps {
  title: string; // songs.title_norm
  artist: string; // songs.artist_norm
  tracks: KaraokeTrack[];
  songId: string;
}

export default function SearchResultItem({
  title,
  artist,
  tracks,
  songId,
}: SearchResultItemProps) {
  return (
    <Link
      href={`/song/${songId}`}
      className="flex justify-between items-center px-5 pt-3 pb-4 border-b border-gray-30 hover:bg-gray-40 active:bg-gray-30 transition-colors duration-150"
    >
      <div className="flex-1 flex flex-col gap-1 items-start justify-center">
        <h3 className="typo-subtitle text-gray-white break-words">{title}</h3>
        <p className="typo-caption text-content-secondary truncate">{artist}</p>
      </div>
      <div className="flex flex-col h-full items-start gap-1">
        {tracks.map((track) => {
          return (
            <div className="flex items-center gap-2" key={track.provider}>
              <KaraokeBadge provider={track.provider} />
              <p className="typo-body text-content-primary w-12 text-center">
                {track.karaokeNo ?? "-"}
              </p>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
