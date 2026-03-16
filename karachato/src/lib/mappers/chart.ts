import type { Song, KaraokeTrack, RankHistory } from "@/types/database";
import type { RankCardProps } from "@/components/chart/RankCard";

/**
 * DB 조인 결과를 RankCard 컴포넌트 props 형태로 변환하는 매퍼 함수
 */

export const toRankCardProps = (
  rank: RankHistory,
  track: KaraokeTrack,
  song: Song,
): RankCardProps => ({
  songId: song.id,

  rank: {
    rank: rank.rank,
    status: rank.delta_status,
  },
  song: {
    titleInProvider: track.title_in_provider, // 노래방 원문 제목
    titleKoJp: track.title_ko_jp, // 일본어만 번역한 제목
    titleKoFull: track.title_ko_full, // 영어까지 번역한 제목
    artistInProvider: track.artist_in_provider, // 노래방 원문 가수명
  },
  // 노래방 번호 + 유튜브 링크 → KaraokeAction 컴포넌트로 전달
  action: {
    karaokeNo: track.karaoke_no,
    // youtube_video_id가 있으면 유튜브 링크 생성, 없으면 null
    url: song.youtube_video_id
      ? `https://www.youtube.com/watch?v=${song.youtube_video_id}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title_in_provider + " " + track.artist_in_provider)}`,
  },
});
