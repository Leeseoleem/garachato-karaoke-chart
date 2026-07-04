import { processPendingSongs, processArtistKo } from "@/lib/ai/process";
import { checkAuth } from "@/utils/auth";

export const maxDuration = 60;
// 하드킬(60s) 전에 여유를 두고 종료해 진행분을 보존 (나머지는 다음 실행이 이어받음)
const TIME_BUDGET_MS = 45_000;

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 두 작업이 같은 60s 예산을 공유 (앞 작업이 예산을 다 쓰면 뒤 작업은 즉시 이월)
    const deadline = Date.now() + TIME_BUDGET_MS;
    await processPendingSongs(deadline);
    await processArtistKo(deadline);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
