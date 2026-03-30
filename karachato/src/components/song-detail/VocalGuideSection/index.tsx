import DifficultyItem, { type DifficultyItemProps } from "./DifficultyItem";
import Tag from "../Tag";
import Divider from "@/components/common/Divider";
import KaraokeTipItem from "./KaraokeTipItem";

type DifficultyScore = Omit<DifficultyItemProps, "label">;

interface VocalGuideSectionProps {
  vocalDifficult: DifficultyScore;
  PronunciationDifficult: DifficultyScore;
  tags: string[];
  tip?: string;
}

export default function VocalGuideSection({
  vocalDifficult,
  PronunciationDifficult,
  tags,
  tip,
}: VocalGuideSectionProps) {
  return (
    <div className="flex flex-col items-start px-4 py-5 gap-3 border gradient-border rounded-xl">
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex items-center justify-center px-[14px] py-[6px] bg-brand-dark border border-brand-light rounded-3xl">
          <p className="typo-description text-brand-light">✦ AI 분석</p>
        </div>
        <div className="flex flex-col items-start gap-3 w-full">
          <DifficultyItem label="보컬 난이도" {...vocalDifficult} />
          <DifficultyItem label="발음 난이도" {...PronunciationDifficult} />
        </div>
        <div className="flex flex-row items-center gap-1">
          {tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>
      {tip && (
        <div className="flex flex-col items-start gap-3 w-full flex-wrap">
          <Divider className="bg-brand-main" />
          <KaraokeTipItem tip={tip} />
        </div>
      )}
    </div>
  );
}
