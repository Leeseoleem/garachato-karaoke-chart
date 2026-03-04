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

// fetch 요청 timeout 시간 (10초)
// TJ 서버가 응답하지 않을 때 무한 대기를 방지
const FETCH_TIMEOUT_MS = 10_000;

// ─────────────────────────────────────────
// fetchWithTimeout: timeout이 적용된 fetch 래퍼
//
// 지정한 시간(timeoutMs) 안에 응답이 없으면 요청을 강제 취소합니다.
// TJ 서버가 먹통일 때 크론 작업 전체가 블로킹되는 것을 방지합니다.
//
// AbortController: fetch 요청을 외부에서 강제 취소하는 브라우저/Node 내장 API
//   controller.abort() 호출 시 → fetch가 AbortError를 throw
// ─────────────────────────────────────────
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();

  // timeoutMs 후 자동으로 요청 취소
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    // 정상 응답이 오면 타이머 제거 (불필요한 abort 방지)
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────
// getCsrfToken: TJ 차트 페이지에서 CSRF 토큰 추출
//
// 반환값:
//   token  → x-csrf-token 헤더에 담을 값
//   cookie → Cookie 헤더에 담을 값 (CSRF_TOKEN + JSESSIONID 조합)
//
// export 없음 — tj.ts 내부에서만 사용하는 함수
// ─────────────────────────────────────────
async function getCsrfToken(): Promise<{ token: string; cookie: string }> {
  const mainRes = await fetchWithTimeout(TJ_CHART_URL, {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!mainRes.ok) {
    throw new Error(
      `Failed to load TJ chart page: ${mainRes.status} ${mainRes.statusText}`,
    );
  }

  const setCookieRaw = mainRes.headers.get("set-cookie") ?? "";

  // CSRF_TOKEN 값 추출
  // 예: "CSRF_TOKEN=abc123; Max-Age=3600; ..." → "abc123"
  const csrfMatch = setCookieRaw.match(/CSRF_TOKEN=([^;]+)/);
  const token = csrfMatch ? decodeURIComponent(csrfMatch[1]) : "";

  // JSESSIONID 값 추출
  const sessionMatch = setCookieRaw.match(/JSESSIONID=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : "";

  if (!token || !sessionId) {
    throw new Error("Failed to extract CSRF_TOKEN or JSESSIONID");
  }

  // Cookie 헤더에 담을 문자열 조합
  const cookie = [
    token ? `CSRF_TOKEN=${token}` : "",
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
//
// TODO: TJ 서버 먹통 시 UI 폴백 처리 필요 (UI 개발 단계에서 구현)
//       - rank_history에서 가장 최근 chart_date를 조회
//       - 해당 날짜 기준으로 차트 표시
//       - UI에 "XX월 XX일 기준 차트 (오늘 데이터 준비 중)" 안내 문구 표시
// ─────────────────────────────────────────
export async function fetchTJJpopChart(): Promise<TJSong[]> {
  const today = getToday();

  // STEP 1. CSRF 토큰 추출
  const { token, cookie } = await getCsrfToken();

  // STEP 2. 차트 API 호출
  const res = await fetchWithTimeout(TJ_CHART_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: TJ_CHART_URL,
      Origin: TJ_BASE_URL,
      "x-requested-with": "XMLHttpRequest",
      "x-csrf-token": token,
      Cookie: cookie,
      "User-Agent": USER_AGENT,
    },
    body: new URLSearchParams({
      chartType: "TOP",
      searchStartDate: getFirstDayOfMonth(),
      searchEndDate: today,
      strType: "3", // 장르 코드. 3 = JPOP
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch TJ chart: ${res.status} ${res.statusText}`,
    );
  }

  const json = (await res.json()) as TJApiResponse;

  // TJ API 자체 응답 코드 검증
  // 99 = 정상, 98 = 요청 거부 (토큰 만료, 파라미터 오류 등)
  // HTTP 200이어도 resultCode가 99가 아니면 데이터가 없으므로 에러 처리
  if (json.resultCode !== "99") {
    throw new Error(
      `TJ API returned non-success resultCode: ${json.resultCode}`,
    );
  }

  // 응답 구조 검증
  // resultData.items가 배열이 아니면 TJ 사이트 구조가 바뀐 것
  // 이 경우 크롤러 셀렉터 점검 필요
  if (!Array.isArray(json.resultData?.items)) {
    throw new Error("TJ API response is missing resultData.items");
  }

  const items = json.resultData.items;

  // TJ API 응답 필드명 → TJSong 필드명으로 변환
  return items.map((item: TJApiItem) => ({
    rank: Number(item.rank), // "1" 같은 문자열을 숫자로 변환
    karaoke_no: String(item.pro), // 혹시 숫자로 올 경우를 대비해 문자열로 통일
    title: item.indexTitle,
    artist: item.indexSong,
    imgthumb_path: item.imgthumb_path,
  }));
}
