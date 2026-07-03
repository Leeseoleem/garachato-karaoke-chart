// 실행 환경 판별.
// 앱인토스(토스 앱 WebView)는 RN WebView라서 window.ReactNativeWebView가 주입돼요.
// 프레임워크(@apps-in-toss) 브릿지도 이 값의 유무로 브라우저/앱을 구분해요.
export function isInTossApp(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView,
    )
  );
}
