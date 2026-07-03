import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SongDetailContent from "@/components/song-detail/SongDetailContent";
import DetailHeader from "@/components/common/headers/DetailHeader";
import SongPendingNotice from "@/components/song-detail/SongPendingNotice";
import { SongDetailSkeleton } from "@/components/skeletons/SongDetailSkeleton";
import { getSongById } from "@/lib/song/queries";
import type { SongDetailRow } from "@/types/database";

// 실제 Supabase(publishable 키 + RLS) 곡 상세 fetch.
export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<SongDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setSong(null); // 새 요청 시작 시 이전 곡 잔존 방지 (URL≠화면 어긋남 방지)
    getSongById(id)
      .then((s) => {
        if (!cancelled) setSong(s);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[SongDetail] 로드 실패", e);
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <SongDetailSkeleton />;
  }

  // 로드 실패 / 곡 없음
  if (error || !song) {
    return (
      <div className="flex flex-col h-dvh min-h-0">
        <DetailHeader />
        <div className="flex flex-1 items-center justify-center typo-caption text-content-secondary">
          {error ? "곡을 불러오지 못했어요." : "곡을 찾을 수 없어요."}
        </div>
      </div>
    );
  }

  // AI 처리 전(pending) — 전용 안내 UI
  if (song.ai_status !== "done") {
    const primary =
      song.karaoke_tracks.find((t) => t.provider === "TJ") ??
      song.karaoke_tracks[0];
    return (
      <div className="flex flex-col h-dvh min-h-0">
        <DetailHeader />
        <SongPendingNotice
          titleOriginal={primary?.title_in_provider ?? ""}
          artistOriginal={primary?.artist_in_provider ?? song.artist_ko ?? ""}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <DetailHeader />
      <SongDetailContent song={song} />
    </div>
  );
}
