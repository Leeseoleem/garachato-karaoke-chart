// Gemini 호출 재시도 헬퍼.
// 구글 API가 간헐적으로 뱉는 404("no longer available" 오응답)·429·5xx·네트워크 오류를
// 지수 백오프로 재시도한다. (파싱/스키마 오류 같은 결정적 실패는 호출부에서 처리 — 여기선 API 호출만 감싼다.)

const RETRYABLE_STATUS = new Set([404, 408, 425, 429, 500, 502, 503, 504]);

function statusOf(err: unknown): number | undefined {
  if (err && typeof err === "object") {
    const s = (err as { status?: unknown }).status;
    if (typeof s === "number") return s;
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") {
      const m = msg.match(/\[(\d{3})\s/);
      if (m) return Number(m[1]);
    }
  }
  return undefined;
}

// 타임아웃/취소로 인한 abort는 재시도하지 않는다.
// (남은 시간 예산으로 timeout을 걸었을 때, 재시도로 예산을 배로 먹는 것을 방지)
// SDK는 GoogleGenerativeAIAbortError를 던지지만 .name을 세팅하지 않아 메시지로 판별한다.
function isAbort(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const msg = (err as { message?: unknown }).message;
  return typeof msg === "string" && /abort/i.test(msg);
}

// status를 못 읽으면 네트워크 오류로 보고 재시도. 단 abort(타임아웃/취소)는 제외.
function isRetryable(err: unknown): boolean {
  if (isAbort(err)) return false;
  const s = statusOf(err);
  return s === undefined || RETRYABLE_STATUS.has(s);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; baseDelayMs?: number; label?: string } = {},
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 800;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === attempts - 1 || !isRetryable(err)) throw err;
      const delay = base * 2 ** i;
      console.warn(
        `[gemini retry] ${opts.label ?? ""} ${i + 1}/${attempts} 실패(status=${statusOf(err) ?? "network"}), ${delay}ms 후 재시도`,
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}
