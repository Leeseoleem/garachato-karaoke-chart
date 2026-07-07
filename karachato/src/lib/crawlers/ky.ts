// ============================================================
// lib/crawlers/ky.ts
//
// 역할: 금영(KY) 노래방 차트 사이트에서 JPOP TOP 100을 가져오는 함수 모음
//
// TJ와 달리 KY는 별도 API가 없고, 차트 페이지가 서버사이드 렌더링된
// HTML이라 cheerio로 표를 직접 파싱한다.
//
// 대상: https://kygabang.com/chart/new_jpop.php
//   - 페이지당 20곡, ?page=1~5로 TOP100 전체.
//   - page=6부터는 101위~라 반드시 1~5로 제한한다.
//   - 셀렉터: 순위 td.ch_daily_01 / 곡번호 td.ch_daily_03 /
//             곡명 td.ch_daily_04 a.opbt(내부 .modal 가사 제거) / 가수 td.ch_daily_05
// ============================================================

import * as cheerio from "cheerio";
import type { KYSong } from "@/types/crawler";
import { KY_CHART_URL, USER_AGENT } from "@/constants/api";

// fetch 요청 timeout (10초). 서버 먹통 시 크론 전체 블로킹 방지 (tj.ts와 동일 패턴)
const FETCH_TIMEOUT_MS = 10_000;

// TOP100 = 페이지당 20곡 × 5페이지. page=6부터는 101위~라 넘기면 안 된다.
const TOTAL_PAGES = 5;

// ─────────────────────────────────────────
// fetchWithTimeout: timeout이 적용된 fetch 래퍼
// AbortController로 timeoutMs 후 요청을 강제 취소한다.
// ─────────────────────────────────────────
async function fetchWithTimeout(
  url: string,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────
// parseChartPage: 차트 페이지 HTML 한 장을 KYSong[]로 파싱
// ─────────────────────────────────────────
function parseChartPage(html: string): KYSong[] {
  const $ = cheerio.load(html);
  const songs: KYSong[] = [];

  $("tr").each((_, row) => {
    const rank = parseInt($(row).find("td.ch_daily_01").text().trim(), 10);
    const karaoke_no = $(row).find("td.ch_daily_03").text().trim();

    // 곡명 셀에는 곡명(a.opbt)과 가사 모달(.modal)이 함께 들어 있어,
    // 모달을 제거한 뒤 곡명만 추출한다.
    const titleCell = $(row).find("td.ch_daily_04");
    titleCell.find(".modal").remove();
    const title = titleCell.find("a.opbt").text().trim();

    const artist = $(row).find("td.ch_daily_05").text().trim();

    // 헤더 행 등 유효하지 않은 행은 건너뛴다.
    if (!rank || !karaoke_no || !title || !artist) return;

    songs.push({ rank, karaoke_no, title, artist });
  });

  return songs;
}

// ─────────────────────────────────────────
// fetchKYJpopChart: 금영 JPOP TOP 100을 가져오는 메인 함수
//
// 반환값: KYSong 배열 (최대 100개)
//
// 한 페이지라도 실패(non-200)하거나 파싱 결과가 0곡이면 throw한다.
// 부분 데이터로 rank_history를 오염시키지 않기 위한 all-or-nothing 정책.
// ─────────────────────────────────────────
export async function fetchKYJpopChart(): Promise<KYSong[]> {
  const all: KYSong[] = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const url = `${KY_CHART_URL}?page=${page}`;
    const res = await fetchWithTimeout(url);

    if (!res.ok) {
      throw new Error(`KY 차트 fetch 실패 (page ${page}): ${res.status}`);
    }

    const songs = parseChartPage(await res.text());

    // 파싱 0곡이면 사이트 구조가 바뀐 것 → 셀렉터 점검 필요
    if (songs.length === 0) {
      throw new Error(
        `KY 차트 파싱 결과 0곡 (page ${page}) - 셀렉터 점검 필요`,
      );
    }

    all.push(...songs);
  }

  return all;
}
