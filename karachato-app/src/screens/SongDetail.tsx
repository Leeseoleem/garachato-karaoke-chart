import SongDetailContent from "@/components/song-detail/SongDetailContent";
import type { SongDetailRow } from "@/types/database";

// S3 임시 목: 실제 백필된 곡(PPPP) 데이터로 곡 소개 카드 데모.
// S2에서 useParams(id) → 클라 getSongById로 교체 예정.
const MOCK_DETAIL: SongDetailRow = {
  id: "c9074738-d6d1-4ee9-8860-420b826705e2",
  ai_status: "done",
  title_ko: "PPPP",
  artist_ko: "TAK",
  thumbnail_url: null,
  youtube_video_id: null,
  description:
    "프로듀서 TAK가 2025년 9월 17일에 투고한 보컬로이드 곡이에요. 유튜브와 니코니코동화에 동시 공개됐고, 하츠네 미쿠 V4X와 중음 테토 SV가 보컬을 맡았어요.",
  ai_category: "보컬로이드",
  ai_traits: ["최신곡"],
  ai_genres: ["보컬로이드", "일렉트로닉"],
  ai_vibes: ["중독적인", "신나는"],
  ai_vocal_score: 4,
  ai_vocal_reason: "빠른 전개와 고음이 있어 난이도가 있는 편이에요.",
  ai_pronunciation_score: 3,
  ai_pronunciation_reason: "일본어 가사가 빠르게 지나가서 연습이 필요해요.",
  ai_karaoke_tip: "박자를 놓치지 않게 원곡을 여러 번 들어보는 걸 추천해요.",
  ai_intro: [
    { label: "투고일", value: "2025년 9월 17일" },
    { label: "투고 플랫폼", value: "유튜브 · 니코니코동화" },
    { label: "프로듀서", value: "TAK" },
    { label: "보컬", value: "하츠네 미쿠 · 중음 테토" },
    { label: "화제", value: "빌보드 재팬 니코니코 VOCALOID SONGS TOP20 3위" },
  ],
  karaoke_tracks: [
    {
      id: 1,
      karaoke_no: "12345",
      provider: "TJ",
      title_in_provider: "PPPP",
      artist_in_provider: "TAK(Feat.初音ミク,重音テト)",
      title_ko_jp: "PPPP",
      title_ko_full: "PPPP",
      artist_ko: "TAK",
      rank_history: [
        {
          rank: 5,
          delta_status: "UP",
          delta_value: 2,
          chart_date: "2026-03-17",
        },
      ],
    },
  ],
};

export default function SongDetail() {
  const song = MOCK_DETAIL;
  return (
    <div className="flex flex-col h-dvh min-h-0">
      <SongDetailContent song={song} />
    </div>
  );
}
