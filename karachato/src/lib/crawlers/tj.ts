// ============================================================
// lib/crawlers/tj.ts
//
// 역할: TJ 미디어 사이트에서 JPOP TOP 100 데이터를 가져오는 함수 모음
//
// TJ API는 CSRF 토큰 검증을 하기 때문에
// 먼저 메인 페이지를 호출해서 토큰을 추출한 뒤
// 그 토큰을 담아서 차트 API를 호출해야 합니다.
//
// 실행 흐름:
//   fetchTJJpopChart()
//     └─ getCsrfToken()  → TJ 차트 페이지 호출 → 토큰 추출
//     └─ 차트 API 호출   → 토큰을 헤더에 담아서 요청
// ============================================================

import type { TJSong, TJApiResponse, TJApiItem } from "@/types/crawler";
import {
  TJ_BASE_URL,
  TJ_CHART_URL,
  TJ_CHART_API_URL,
  USER_AGENT,
} from "@/constants/api";
import { getToday, getFirstDayOfMonth } from "@/utils/date";

// ─────────────────────────────────────────
// getCsrfToken: TJ 차트 페이지에서 CSRF 토큰 추출
//
// 반환값:
//   token  → x-csrf-token 헤더에 담을 값 (encodeURIComponent 적용됨)
//   cookie → Cookie 헤더에 담을 값 (CSRF_TOKEN + JSESSIONID 조합)
//
// export 없음 — tj.ts 내부에서만 사용하는 함수
// ─────────────────────────────────────────
async function getCsrfToken(): Promise<{ token: string; cookie: string }> {
  const mainRes = await fetch(TJ_CHART_URL, {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  const setCookieRaw = mainRes.headers.get("set-cookie") ?? "";

  // CSRF_TOKEN 값 추출
  // 예: "CSRF_TOKEN=abc123; Max-Age=3600; ..." → "abc123"
  const csrfMatch = setCookieRaw.match(/CSRF_TOKEN=([^;]+)/);
  const token = csrfMatch ? decodeURIComponent(csrfMatch[1]) : "";

  // JSESSIONID 값 추출
  const sessionMatch = setCookieRaw.match(/JSESSIONID=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : "";

  // Cookie 헤더에 담을 문자열 조합
  const cookie = [
    token ? `CSRF_TOKEN=${token}` : "", // encodeURIComponent 제거
    sessionId ? `JSESSIONID=${sessionId}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  return { token, cookie };
}

// ─────────────────────────────────────────
// fetchTJJpopChart: TJ JPOP TOP 100을 가져오는 메인 함수
//
// 반환값: TJSong 배열 (최대 100개)
// ─────────────────────────────────────────
export async function fetchTJJpopChart(): Promise<TJSong[]> {
  const today = getToday();

  // STEP 1. CSRF 토큰 추출
  const { token, cookie } = await getCsrfToken();

  // STEP 2. 차트 API 호출
  const res = await fetch(TJ_CHART_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: TJ_CHART_URL,
      Origin: TJ_BASE_URL,
      "x-requested-with": "XMLHttpRequest",
      "x-csrf-token": token, // 특수문자 인코딩
      Cookie: cookie, // getCsrfToken에서 조합된 값
      "User-Agent": USER_AGENT,
    },
    body: new URLSearchParams({
      chartType: "TOP",
      searchStartDate: getFirstDayOfMonth(),
      searchEndDate: today,
      strType: "3", // 장르 코드. 3 = JPOP
    }),
  });

  const json = (await res.json()) as TJApiResponse;

  const items = json.resultData?.items ?? []; // resultData.items가 없으면 빈 배열

  // TJ API 응답 필드명 → TJSong 필드명으로 변환
  return items.map((item: TJApiItem) => ({
    rank: Number(item.rank), // "1" 같은 문자열을 숫자로 변환
    karaoke_no: String(item.pro), // 혹시 숫자로 올 경우를 대비해 문자열로 통일
    title: item.indexTitle,
    artist: item.indexSong,
    imgthumb_path: item.imgthumb_path,
  }));
}
