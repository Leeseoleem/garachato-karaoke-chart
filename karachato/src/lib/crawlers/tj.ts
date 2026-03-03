import type { TJSong, TJApiItem } from "@/types/crawler";
import { TJ_CHART_API_URL } from "@/constants/api";

/**
 * 개요:
 * TJ 미디어 사이트에서 J-POP TOP 100 데이터를 가져오는 함수
 */

// TJ J-POP TOP 100을 가져오는 메인 함수
export async function fetchTJJpopChart(): Promise<TJSong[]> {
  const today = new Date().toISOString().slice(0, 10);

  const res = await fetch(TJ_CHART_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      chartType: "TOP",
      searchStartDate: today,
      searchEndDate: today,
      strType: "3",
    }),
  });

  const json = await res.json();
  const items = json.resultData?.items ?? []; // resultData.items가 없으면 빈 배열로 처리

  // TJ API 응답 필드명 → 우리가 쓸 TJSong 필드명으로 변환
  return items.map((item: TJApiItem) => ({
    rank: Number(item.rank), // "1" 같은 문자열을 숫자로 변환
    karaoke_no: String(item.pro), // 혹시 숫자로 올 경우를 대비해 문자열로 통일
    title: item.indexTitle,
    artist: item.indexSong,
    imgthumb_path: item.imgthumb_path,
  }));
}
