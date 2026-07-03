// 실행 환경 판별.
// 앱인토스(토스 앱 WebView)는 RN WebView라서 window.ReactNativeWebView가 주입돼요.
// 프레임워크(@apps-in-toss) 브릿지도 이 값의 유무로 브라우저/앱을 구분해요.
//
// 개발 미리보기: 실제 앱에 올리지 않고 "앱 분기"를 확인하려면 dev 서버에서
//   localStorage.setItem("force-platform", "app")  // 앱처럼
//   localStorage.setItem("force-platform", "web")  // 웹처럼
//   localStorage.removeItem("force-platform")       // 실제 감지로
// 설정 후 새로고침. 이 override는 dev 빌드에서만 동작하고 프로덕션엔 안 들어가요.
export function isInTossApp(): boolean {
  if (typeof window === "undefined") return false;

  if (import.meta.env.DEV) {
    const forced = window.localStorage.getItem("force-platform");
    if (forced === "app") return true;
    if (forced === "web") return false;
  }

  return Boolean(
    (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView,
  );
}
