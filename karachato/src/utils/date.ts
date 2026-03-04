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

// 이번 달 1일 반환. 예: "2026-03-01"
export function getFirstDayOfMonth(timeZone: string = CHART_TIME_ZONE): string {
  const today = formatDateInTimeZone(new Date(), timeZone);
  return `${today.slice(0, 7)}-01`;
}
