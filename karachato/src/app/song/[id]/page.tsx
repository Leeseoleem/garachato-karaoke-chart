import { notFound } from "next/navigation";
// === components ===
import BackHeader from "@/components/common/headers/BackHeader";
import SongDetailContent from "@/components/song-detail/SongDetailContent";
// === queries ===
import { getSongById } from "@/lib/song/queries";

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const song = await getSongById(id);

  if (!song) return notFound();

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <BackHeader title="곡 상세 정보" />
      <SongDetailContent song={song} />
    </div>
  );
}
