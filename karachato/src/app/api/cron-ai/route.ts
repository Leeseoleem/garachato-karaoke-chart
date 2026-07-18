import {
  processPendingSongs,
  backfillSongIntros,
  processArtistKo,
} from "@/lib/ai/process";
import { checkAuth } from "@/utils/auth";

export const maxDuration = 60;
// 하드킬(60s) 전에 여유를 두고 종료해 진행분을 보존 (나머지는 다음 실행이 이어받음)
const TIME_BUDGET_MS = 45_000;

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 세 작업이 같은 60s 예산을 공유. 번역(신규곡 done)을 최우선으로 두고,
    // 남는 예산에서 리치 인트로 백필 → artist_ko 보강 순으로 이어받는다.
    const deadline = Date.now() + TIME_BUDGET_MS;
    await processPendingSongs(deadline);
    await backfillSongIntros(deadline);
    await processArtistKo(deadline);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
