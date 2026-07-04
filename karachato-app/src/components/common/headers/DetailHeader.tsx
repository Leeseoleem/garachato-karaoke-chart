// === component ===
import Header from "./Header";
import BackButton from "./BackButton";
import { isInTossApp } from "@/lib/platform";

interface DetailHeaderProps {
  title?: string;
}

// 플랫폼 분기 헤더.
// - 앱(토스): 호스트 네비바가 뒤로가기를 제공하므로 중앙 텍스트 헤더만.
// - 웹: 호스트 네비바가 없으니 자체 뒤로가기 버튼.
export default function DetailHeader({ title = "곡 상세 정보" }: DetailHeaderProps) {
  if (isInTossApp()) {
    return (
      <Header className="shrink-0 justify-center">
        <p className="typo-label text-brand-light">{title}</p>
      </Header>
    );
  }

  return (
    <Header className="shrink-0">
      <div className="flex flex-row items-center gap-4">
        <BackButton />
        {title && <p className="typo-label text-brand-light">{title}</p>}
      </div>
    </Header>
  );
}
