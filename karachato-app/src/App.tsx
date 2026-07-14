import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SafeAreaInsets } from "@apps-in-toss/web-framework";
import Home from "./screens/Home";
import Search from "./screens/Search";
import SongDetail from "./screens/SongDetail";
import Explore from "./screens/Explore";

export default function App() {
  // 토스 웹뷰 safe-area를 CSS 변수(--safe-top/--safe-bottom)로 노출.
  // CSS env()가 웹뷰에서 부정확(시스템바 과다계산)하므로 토스 API 값을 사용.
  // 비-토스(브라우저) 환경에선 get/subscribe가 throw → 무시, var(...,0px) 폴백으로 0.
  useEffect(() => {
    const apply = (insets: { top: number; bottom: number }) => {
      const root = document.documentElement;
      root.style.setProperty("--safe-top", `${insets.top}px`);
      root.style.setProperty("--safe-bottom", `${insets.bottom}px`);
    };
    try {
      apply(SafeAreaInsets.get());
    } catch {
      // 비-토스 환경
    }
    let cleanup = () => {};
    try {
      cleanup = SafeAreaInsets.subscribe({ onEvent: apply });
    } catch {
      // 구독 미지원
    }
    return () => cleanup();
  }, []);

  return (
    <div className="mx-auto w-full max-w-page">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<Search />} />
        <Route path="/song/:id" element={<SongDetail />} />
      </Routes>
    </div>
  );
}
