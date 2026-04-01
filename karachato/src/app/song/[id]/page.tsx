import { notFound } from "next/navigation";
import { Metadata } from "next";
// === components ===
import BackHeader from "@/components/common/headers/BackHeader";
import SongDetailContent from "@/components/song-detail/SongDetailContent";
// === queries ===
import { getSongById } from "@/lib/song/queries";
// === constants ===
import { SITE_NAME } from "@/constants/site";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const song = await getSongById(id);

  if (!song) return { title: "곡을 찾을 수 없습니다" };

  const title = song.title_ko ?? "Unknown";
  const artist = song.artist_ko ?? "";
  const description =
    song.description ??
    `${title} - ${artist} 노래방 번호와 AI 해설을 확인하세요.`;

  return {
    title: `${title} - ${artist}`,
    description,
    openGraph: {
      title: `${title} - ${artist} | ${SITE_NAME}`,
      description,
      images: song.thumbnail_url
        ? [{ url: song.thumbnail_url, width: 480, height: 360, alt: title }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${artist} | ${SITE_NAME}`,
      description,
      images: song.thumbnail_url ? [song.thumbnail_url] : ["/og-image.png"],
    },
  };
}

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
