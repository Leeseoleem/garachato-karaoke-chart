import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "가라챠토!(カラチャート!)",
  description: "국내 노래방 J-POP 차트 TOP 100 · AI 한글 번역 및 곡 해설 제공",
  /** TODO: openGraph 추가 */
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
