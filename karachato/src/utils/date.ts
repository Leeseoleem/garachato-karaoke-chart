const CHART_TIME_ZONE = "Asia/Seoul" as const;

function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  // formatToParts 결과에서 year/month/day만 추출
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format date parts.");
  }

  return `${year}-${month}-${day}`; // YYYY-MM-DD
}

export function getToday(timeZone: string = CHART_TIME_ZONE): string {
  return formatDateInTimeZone(new Date(), timeZone);
}

// TJ 크롤링 시작 날짜 반환
// 오늘이 1일이면 전달 마지막 날, 아니면 이번 달 1일
export function getTJStartDate(timeZone: string = CHART_TIME_ZONE): string {
  const today = formatDateInTimeZone(new Date(), timeZone);
  const day = today.slice(8, 10); // DD

  if (day === "01") {
    // 전달 마지막 날.
    // 서버 로컬 타임존(UTC 등) 영향을 제거하기 위해, KST로 뽑은 today의 연·월을 쓰고
    // Date.UTC + getUTC* 로 계산한다. Date.UTC(year, month-1, 0) = KST 이번 달의 전날 = 전달 말일.
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7)); // 1-12 (KST 이번 달)
    const lastDay = new Date(Date.UTC(year, month - 1, 0));
    const y = lastDay.getUTCFullYear();
    const m = String(lastDay.getUTCMonth() + 1).padStart(2, "0");
    const d = String(lastDay.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return `${today.slice(0, 7)}-01`;
}
