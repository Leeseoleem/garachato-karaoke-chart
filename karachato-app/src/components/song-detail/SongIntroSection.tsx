import Divider from "@/components/common/Divider";

interface SongFact {
  label: string;
  value: string;
}

interface SongIntroSectionProps {
  description: string;
  facts: SongFact[];
}

// 곡 소개 카드: 산문 설명(위) + 구조화 사실 리스트(아래). 보컬 가이드 카드와 통일된 스타일.
export default function SongIntroSection({
  description,
  facts,
}: SongIntroSectionProps) {
  return (
    <div className="flex flex-col items-start px-4 py-5 gap-3 border gradient-border rounded-xl">
      <div className="flex items-center justify-center px-3.5 py-1.5 bg-brand-dark border border-brand-light rounded-3xl">
        <p className="typo-description text-brand-light">✦ 곡 소개</p>
      </div>

      <p className="typo-caption text-content-primary leading-relaxed whitespace-pre-line wrap-break-word">
        {description}
      </p>

      {facts.length > 0 && (
        <>
          <Divider className="bg-brand-main" />
          <dl className="flex flex-col gap-2 sm:gap-4 sm:py-2 w-full">
            {facts.map((fact, i) => (
              <div key={`${fact.label}-${i}`} className="flex flex-row gap-3">
                <dt className="typo-caption text-content-secondary shrink-0 w-16">
                  {fact.label}
                </dt>
                <dd className="typo-caption text-content-primary flex-1 wrap-break-word sm:text-right">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
