import type { SongDetailRow } from "@/types/database";
import type { DeltaStatus } from "@/types/domain";

// === component ===
import SongHeroSection from "./SongHeroSection";
import SongKaraokeNumber from "./SongKaraokeNumber";
import SongIntroSection from "./SongIntroSection";
import SongInfoSection from "./SongInfoSection";
import VocalGuideSection from "./VocalGuideSection";

export default function SongDetailContent({ song }: { song: SongDetailRow }) {
  const tjTrack = song.karaoke_tracks.find((t) => t.provider === "TJ");
  const kyTrack = song.karaoke_tracks.find((t) => t.provider === "KY");
  const primaryTrack = tjTrack ?? kyTrack;

  const latestRank = primaryTrack?.rank_history
    ?.slice()
    .sort((a, b) => b.chart_date.localeCompare(a.chart_date))[0];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col px-5 py-3 gap-6">
        <SongHeroSection
          titleKo={
            primaryTrack?.title_ko_jp ?? primaryTrack?.title_in_provider ?? ""
          }
          titleInProvider={primaryTrack?.title_in_provider ?? ""}
          artistKo={primaryTrack?.artist_ko ?? song.artist_ko}
          artistInProvider={primaryTrack?.artist_in_provider ?? ""}
          thumbnailUrl={song.thumbnail_url}
          youtubeVideoId={song.youtube_video_id}
        />
        <div className="flex flex-row w-full items-center gap-4">
          <SongKaraokeNumber provider="TJ" karaokeNo={tjTrack?.karaoke_no} />
          <SongKaraokeNumber provider="KY" karaokeNo={kyTrack?.karaoke_no} />
        </div>

        {/* 곡 소개 (설명 + 상세 리스트) */}
        <SongIntroSection
          description={song.description ?? "곡에 대한 설명이 없어요."}
          facts={song.ai_intro ?? []}
        />

        {/* 곡 정보 (순위·카테고리) */}
        <SongInfoSection
          rankInfo={{
            currentRank: latestRank?.rank ?? null,
            currentStatus: (latestRank?.delta_status ??
              "UNKNOWN") as DeltaStatus,
            previousRank:
              latestRank?.delta_status !== "NEW" &&
              latestRank?.delta_value != null &&
              latestRank?.rank != null
                ? latestRank.rank + latestRank.delta_value
                : null,
          }}
          tags={[song.ai_category ?? "JPOP", ...(song.ai_traits ?? [])]}
        />

        {/* 보컬 가이드 (난이도·팁) */}
        <VocalGuideSection
          vocalDifficult={{
            score: song.ai_vocal_score ?? 0,
            reason: song.ai_vocal_reason ?? "",
          }}
          PronunciationDifficult={{
            score: song.ai_pronunciation_score ?? 0,
            reason: song.ai_pronunciation_reason ?? "",
          }}
          tags={song.ai_vibes ?? []}
          tip={song.ai_karaoke_tip ?? ""}
        />
      </div>
    </div>
  );
}
