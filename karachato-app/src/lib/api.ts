// 백엔드(Next/Vercel) API 절대 URL 조립.
// 챗봇처럼 시크릿 키가 필요한 API는 앱에 못 넣고 서버에 두므로, 앱은 이 주소로 원격 호출해요.
// VITE_API_BASE = 서버 API 배포 주소 (예: https://garachato-karaoke-chart.vercel.app)
// 빌드 시점에 값이 박히므로, ait build / vite build 전에 env가 있어야 해요.
const API_BASE = (
  (import.meta.env.VITE_API_BASE as string | undefined) ?? ""
).replace(/\/$/, "");

// 누락 시 조용히 상대경로로 폴백되면 웹뷰에서 챗봇 호출이 앱 origin으로 새어나가 실패함.
// throw는 과하므로(챗 안 쓰는 화면까지 죽음) dev에서 경고만.
if (import.meta.env.DEV && !API_BASE) {
  console.warn(
    "[api] VITE_API_BASE가 비어 있어요. /api/* 호출이 앱 자체 origin으로 나가 챗봇 등이 실패할 수 있어요. karachato-app/.env.local에 VITE_API_BASE를 설정하세요.",
  );
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
