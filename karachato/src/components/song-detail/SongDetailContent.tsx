import type { RankHistoryWithJoin } from "@/types/database";
// === component ===
import SongHeroSection from "./SongHeroSection";
import SongKaraokeNumber from "./SongKaraokeNumber";
import SongInfoSection from "./SongInfoSection";
import VocalGuideSection from "./VocalGuideSection";

export default function SongDetailContent({
  track,
}: {
  track: RankHistoryWithJoin;
}) {
  const { karaoke_tracks } = track;
  const { songs, ...trackInfo } = karaoke_tracks;

  return (
    <div className="flex-1 overflow-y-auto py-6 px-4 gap-6">
      <SongHeroSection
        titleKo={trackInfo.title_ko_jp ?? trackInfo.title_in_provider}
        titleInProvider={trackInfo.title_in_provider}
        artistKo={trackInfo.artist_ko}
        artistInProvider={trackInfo.artist_in_provider}
        thumbnailUrl={songs.thumbnail_url}
        youtubeVideoId={songs.youtube_video_id}
      />
      <div className="flex flex-row w-full items-center gap-4 py-6">
        <SongKaraokeNumber provider="TJ" karaokeNo={trackInfo.karaoke_no} />
        <SongKaraokeNumber provider="KY" />
      </div>
      <SongInfoSection
        rankInfo={{
          currentRank: track.rank,
          currentStatus: track.delta_status,
          previousRank:
            track.delta_value !== null
              ? track.rank +
                (track.delta_status === "UP"
                  ? track.delta_value
                  : -track.delta_value)
              : null,
        }}
        description={songs.description ?? "곡에 대한 설명이 없습니다."}
        tags={[
          songs.ai_category ?? "JPOP",
          ...(songs.ai_traits ?? []),
          ...(songs.ai_vibes ?? []),
        ]}
      />
      <VocalGuideSection
        vocalDifficult={{
          score: songs.ai_vocal_score ?? 0,
          reason: songs.ai_vocal_reason ?? "",
        }}
        PronunciationDifficult={{
          score: songs.ai_pronunciation_score ?? 0,
          reason: songs.ai_pronunciation_reason ?? "",
        }}
        tags={songs.ai_vibes ?? []}
        tip={songs.ai_karaoke_tip ?? ""}
      />
    </div>
  );
}
