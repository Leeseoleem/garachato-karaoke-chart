import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SongDetailContent from "@/components/song-detail/SongDetailContent";
import DetailHeader from "@/components/common/headers/DetailHeader";
import { getSongById } from "@/lib/song/queries";
import type { SongDetailRow } from "@/types/database";

// 실제 Supabase(publishable 키 + RLS) 곡 상세 fetch.
export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<SongDetailRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getSongById(id)
      .then((s) => {
        if (!cancelled) setSong(s);
      })
      .catch((e) => console.error("[SongDetail] 로드 실패", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center typo-caption text-content-secondary">
        불러오는 중…
      </div>
    );
  }

  if (!song || song.ai_status !== "done") {
    return (
      <div className="flex h-dvh items-center justify-center typo-caption text-content-secondary">
        {song ? "준비 중인 곡이에요." : "곡을 찾을 수 없어요."}
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
