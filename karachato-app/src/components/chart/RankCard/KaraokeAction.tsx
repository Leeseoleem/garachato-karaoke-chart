import YoutubeButton from "@/components/common/buttons/YoutubeButton";

export interface KaraokeActionProps {
  karaokeNo: string;
  url?: string;
}

export default function KaraokeAction({ karaokeNo, url }: KaraokeActionProps) {
  return (
    <div className="flex flex-col gap-2 justify-center items-end">
      <p className="typo-subtitle text-content-primary">{karaokeNo}</p>
      <YoutubeButton url={url} />
    </div>
  );
}
