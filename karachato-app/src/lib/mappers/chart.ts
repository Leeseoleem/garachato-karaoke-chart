import type { RankHistoryWithJoin } from "@/types/database";
import type { RankCardProps } from "@/components/chart/RankCard";
import type { DeltaStatus } from "@/types/domain";

/**
 * DB 조인 결과를 RankCard 컴포넌트 props 형태로 변환하는 매퍼 함수
 */

export const toRankCardProps = (item: RankHistoryWithJoin): RankCardProps => ({
  songId: item.karaoke_tracks.songs.id,
  rank: {
    rank: item.rank,
    status: item.delta_status as DeltaStatus,
  },
  song: {
    titleInProvider: item.karaoke_tracks.title_in_provider,
    titleKoJp: item.karaoke_tracks.title_ko_jp,
    titleKoFull: item.karaoke_tracks.title_ko_full,
    artistInProvider: item.karaoke_tracks.artist_in_provider,
    artistKo: item.karaoke_tracks.artist_ko,
  },
  action: {
    karaokeNo: item.karaoke_tracks.karaoke_no,
    url: item.karaoke_tracks.songs.youtube_video_id
      ? `https://www.youtube.com/watch?v=${item.karaoke_tracks.songs.youtube_video_id}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(item.karaoke_tracks.title_in_provider + " " + item.karaoke_tracks.artist_in_provider)}`,
  },
});

export const toRankCardPropsList = (
  items: RankHistoryWithJoin[],
): RankCardProps[] => items.map(toRankCardProps);
