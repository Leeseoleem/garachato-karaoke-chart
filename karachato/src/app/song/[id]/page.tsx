import { notFound } from "next/navigation";
// === components ===
import BackHeader from "@/components/common/headers/BackHeader";
import SongDetailContent from "@/components/song-detail/SongDetailContent";
// === mock ===
import { MOCK_CHART_ITEMS } from "@/lib/mock";

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const MOCK_SONG = MOCK_CHART_ITEMS.find(
    (item) => String(item.karaoke_track_id) === id,
  );

  if (!MOCK_SONG) return notFound();

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <BackHeader title="곡 상세 정보" />
      <SongDetailContent track={MOCK_SONG} />
    </div>
  );
}
