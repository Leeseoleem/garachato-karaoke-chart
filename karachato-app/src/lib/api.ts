// 백엔드(Next/Vercel) API 절대 URL 조립.
// 챗봇처럼 시크릿 키가 필요한 API는 앱에 못 넣고 서버에 두므로, 앱은 이 주소로 원격 호출해요.
// VITE_API_BASE = 서버 API 배포 주소 (예: https://garachato-karaoke-chart.vercel.app)
// 빌드 시점에 값이 박히므로, ait build / vite build 전에 env가 있어야 해요.
const API_BASE = (
  (import.meta.env.VITE_API_BASE as string | undefined) ?? ""
).replace(/\/$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
