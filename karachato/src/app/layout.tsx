import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

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
    <html lang="ko" className={pretendard.variable}>
      <body className="antialiased">
        <main className="mx-auto w-full max-w-page">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
