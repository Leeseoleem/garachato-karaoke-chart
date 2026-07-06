import { createServerClient } from "@/lib/supabase/server";
import { extractIntent } from "@/lib/gemini/intent";

import { escapePostgrestValue } from "@/utils/string";
import { getToday } from "@/utils/date";

import type { ChatMessage, SongCandidateMessage, ChatTurn } from "@/types/chat";
import type { ChatIntent } from "@/types/gemini";

import {
  GreetingsMessages,
  ClosingMessages,
  traceUKeywords,
  traceUMessages,
} from "@/constants/easter";

// ────────────────────────────────────────────
//  전처리 (Gemini 호출 전, API 쿼터 미소모)
// ────────────────────────────────────────────
function checkEasterEgg(message: string): ChatMessage | null {
  const t = message.trim().toLowerCase();
  if (GreetingsMessages.includes(t)) {
    return {
      type: "text",
      role: "model",
      message: "안녕하세요! 찾고 싶은 곡이나 가수가 있으신가요? 😊",
    };
  }

  if (ClosingMessages.includes(t)) {
    return {
      type: "text",
      role: "model",
      message: "도움이 되었다니 기뻐요! 언제든지 또 찾아주세요! 👋",
    };
  }

  if (traceUKeywords.some((kw) => t.includes(kw))) {
    const randomMessage =
      traceUMessages[Math.floor(Math.random() * traceUMessages.length)];
    return {
      type: "text",
      role: "model",
      message: randomMessage,
    };
  }
  return null;
}

// ────────────────────────────────────────────
// TOP 100 여부 — 단건 (search_song 전용)
// ────────────────────────────────────────────
async function checkIsInTop100(songId: string): Promise<boolean> {
  const supabase = createServerClient();
  const today = getToday();

  // STEP 1. song_id로 karaoke_track_id 목록 조회
  const { data: tracks } = await supabase
    .from("karaoke_tracks")
    .select("id")
    .eq("song_id", songId);

  if (!tracks || tracks.length === 0) return false;

  const trackIds = tracks.map((t) => t.id);

  // STEP 2. track_id 목록으로 오늘 rank_history 존재 여부 확인
  const { data } = await supabase
    .from("rank_history")
    .select("id")
    .eq("chart_date", today)
    .in("karaoke_track_id", trackIds)
    .limit(1)
    .maybeSingle();

  return data !== null;
}

// ────────────────────────────────────────────
// SongCandidateMessage["song"] 빌더
// ────────────────────────────────────────────
function buildSongField(
  songId: string,
  tracks: {
    provider: string;
    karaoke_no: string;
    title_ko_jp: string | null;
    artist_ko: string | null;
    title_in_provider: string;
    artist_in_provider: string;
  }[],
  isInTop100: boolean,
): SongCandidateMessage["song"] {
  const primary = tracks[0];
  return {
    songId,
    titleKo: primary?.title_ko_jp ?? null,
    artistKo: primary?.artist_ko ?? null,
    titleInProvider: primary?.title_in_provider ?? "",
    artistInProvider: primary?.artist_in_provider ?? "",
    karaokeTracks: tracks.map((t) => ({
      provider: t.provider as "TJ" | "KY",
      karaokeNo: t.karaoke_no,
    })),
    isInTop100,
  };
}

// ────────────────────────────────────────────
// 핸들러: 곡 제목 검색
// ────────────────────────────────────────────
async function handleSearchSong(
  keyword: string,
  excludeIds: string[] = [],
): Promise<Response> {
  const supabase = createServerClient();
  const safeKeyword = escapePostgrestValue(keyword);

  let query = supabase
    .from("songs")
    .select(
      `
      id,
      karaoke_tracks (
        provider, karaoke_no, title_ko_jp,
        title_in_provider, artist_ko, artist_in_provider
      )
    `,
    )
    .or(`title_ko_norm.ilike.%${keyword}%,title_norm.ilike.%${safeKeyword}%`)
    .eq("ai_status", "done");
  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }
  const { data } = await query.limit(1).maybeSingle();

  if (!data) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message:
        excludeIds.length > 0
          ? "이 조건엔 더 이상 다른 곡이 없어요. 다른 곡이나 가수를 물어봐 주세요."
          : `"${keyword}" 곡을 찾지 못했어요. 제목을 다시 확인해볼까요?`,
    } satisfies ChatMessage);
  }

  // 단건이므로 개별 쿼리 유지
  const isInTop100 = await checkIsInTop100(data.id);
  const song = buildSongField(data.id, data.karaoke_tracks ?? [], isInTop100);

  return Response.json({
    type: "song_candidate",
    role: "model",
    song_id: data.id,
    message: `"${song.titleKo ?? song.titleInProvider}" 이 곡 맞으세요?`,
    song,
    intent: { intent: "search_song", keyword },
  } satisfies ChatMessage);
}

// ────────────────────────────────────────────
// 핸들러: 가수명 검색
// ────────────────────────────────────────────
// 여러 가수명 분리: "初音ミク, 重音テト" / "미쿠 & 테토" 등. (공백만으론 분리 안 함 — 단일 가수명 보호)
function splitArtistNames(keyword: string): string[] {
  const parts = keyword
    .split(/\s*(?:,|、|・|\/|／|&|＆|＋|\+|×|·|feat\.?|ft\.?|\band\b)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [keyword.trim()];
}

// 가수명(들)로 곡 id 목록 조회. search_songs(피처링 포함) + 여러 가수는 교집합(협업곡), 없으면 합집합.
async function getArtistSongIds(keyword: string): Promise<string[]> {
  const supabase = createServerClient();
  const names = splitArtistNames(keyword);
  const idSets = await Promise.all(
    names.map(async (n) => {
      const { data, error } = await supabase.rpc("search_songs", { query: n });
      if (error) throw error; // RPC 장애를 "곡 없음"으로 숨기지 않고 오류 경로로
      return new Set<string>(
        ((data ?? []) as { song_id: string }[]).map((r) => r.song_id),
      );
    }),
  );
  let ids: string[] = idSets.length > 0 ? [...idSets[0]] : [];
  for (let i = 1; i < idSets.length; i++) {
    ids = ids.filter((id) => idSets[i].has(id));
  }
  if (ids.length === 0 && idSets.length > 1) {
    ids = [...new Set(idSets.flatMap((s) => [...s]))];
  }
  return ids;
}

// 넓은 가수 결과에서 옵션 좁히기를 시작할 최소 곡 수
const OPTION_MIN_SONGS = 6;

// 가수 곡들의 실제 메타(vibe/trait/category)에서 좁히기 옵션 도출.
// 일부 곡에만 있는 값(2곡 이상, 전부는 아님)만 = 실제로 좁혀지는 옵션. dead-end 없음.
async function deriveArtistOptions(
  artist: string,
  songIds: string[],
): Promise<{ label: string; intent: ChatIntent }[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("songs")
    .select("ai_category, ai_vibes, ai_traits")
    .in("id", songIds);
  if (!data) return [];

  const rows = data as {
    ai_category: string | null;
    ai_vibes: string[] | null;
    ai_traits: string[] | null;
  }[];
  const total = rows.length;
  const tally = (getVals: (r: (typeof rows)[number]) => string[]) => {
    const m = new Map<string, number>();
    for (const r of rows) getVals(r).forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const opts: { label: string; intent: ChatIntent }[] = [];
  const add = (
    label: string,
    filter: { vibe?: string; trait?: string; category?: string },
    c: number,
  ) => {
    if (c >= 2 && c < total && opts.length < 3) {
      opts.push({ label, intent: { intent: "recommend", artist, ...filter } });
    }
  };
  // 분위기 > 특성 > 카테고리 순 (사용자 직관 우선)
  tally((r) => r.ai_vibes ?? []).forEach(([v, c]) => add(`${v} 곡`, { vibe: v }, c));
  tally((r) => r.ai_traits ?? []).forEach(([t, c]) => add(t, { trait: t }, c));
  tally((r) => (r.ai_category ? [r.ai_category] : [])).forEach(([cat, c]) =>
    add(cat, { category: cat }, c),
  );
  return opts.slice(0, 3);
}

async function handleSearchArtist(
  keyword: string,
  excludeIds: string[] = [],
): Promise<Response> {
  const ids = (await getArtistSongIds(keyword)).filter(
    (id) => !excludeIds.includes(id),
  );

  if (ids.length === 0) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message:
        excludeIds.length > 0
          ? `"${keyword}" 가수의 다른 곡이 더 없어요. 다른 가수나 조건을 물어봐 주세요.`
          : `"${keyword}" 가수의 곡을 찾지 못했어요.`,
    } satisfies ChatMessage);
  }

  // 첫 요청(제외목록 없음) + 결과 다수 + 옵션 2개+ → 곡 대신 선택지로 좁히기
  if (excludeIds.length === 0 && ids.length >= OPTION_MIN_SONGS) {
    const options = await deriveArtistOptions(keyword, ids);
    if (options.length >= 2) {
      return Response.json({
        type: "option_prompt",
        role: "model",
        message: `"${keyword}" 곡이 많네요! 어떤 걸 찾으세요?`,
        options: [
          ...options,
          {
            label: "아무거나",
            intent: { intent: "recommend", artist: keyword },
          },
        ],
      } satisfies ChatMessage);
    }
  }

  // 좁은 결과거나 옵션 부족 → 첫 곡 바로.
  //  ids는 관련도 순인데 ai_status='done'이 보장되지 않으므로, ids 순서대로 '완료된' 첫 곡을 고른다.
  //  (ids[0]이 아직 미완료(번역 전)여도 뒤의 완료곡으로 넘어감.)
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select(
      `
      id,
      karaoke_tracks (
        provider, karaoke_no, title_ko_jp,
        title_in_provider, artist_ko, artist_in_provider
      )
    `,
    )
    .in("id", ids)
    .eq("ai_status", "done");
  if (error) throw error;

  const byId = new Map((data ?? []).map((r) => [r.id, r]));
  const firstDone = ids.map((id) => byId.get(id)).find((r) => r != null);

  if (!firstDone) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message: `"${keyword}" 가수의 곡을 찾지 못했어요.`,
    } satisfies ChatMessage);
  }

  const isInTop100 = await checkIsInTop100(firstDone.id);
  const song = buildSongField(
    firstDone.id,
    firstDone.karaoke_tracks ?? [],
    isInTop100,
  );

  return Response.json({
    type: "song_candidate" as const,
    role: "model" as const,
    song_id: firstDone.id,
    message: `"${song.titleKo ?? song.titleInProvider}" 이 곡은 어떠세요?`,
    song,
    intent: { intent: "search_artist", keyword },
  } satisfies ChatMessage);
}

// ai_intro(AI 소개)의 발매/투고 날짜 라벨을 찾아 파싱 → 정렬용 timestamp(ms).
// "2021년 6월 5일", "2021년 4월 27일 (디지털 싱글)", "2026년 1월 9일(선행), 2월 11일" 등 첫 YYYY-M-D.
function parseIntroReleaseDate(aiIntro: unknown): number | null {
  if (!Array.isArray(aiIntro)) return null;
  for (const e of aiIntro) {
    if (!e || typeof e !== "object") continue;
    const { label, value } = e as { label?: unknown; value?: unknown };
    if (typeof label !== "string" || typeof value !== "string") continue;
    if (!/투고|발매|발표|공개/.test(label)) continue;
    const md = value.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
    if (md) return Date.UTC(+md[1], +md[2] - 1, +md[3]);
    const y = value.match(/(\d{4})/); // 연도만 있는 경우
    if (y) return Date.UTC(+y[1], 0, 1);
  }
  return null;
}

// "최신곡" 정렬: 발매/투고일 있는 곡을 최신순으로 먼저, 날짜 없는 곡은 뒤로(수집일 최신순).
//  created_at('우리 수집일')은 발매일보다 큰 값이 되기 쉬워 폴백으로 섞으면 날짜 없는 곡이
//  신곡 목록을 오염시킴 → 날짜 있는 곡을 항상 우선.
function createdMs(created?: string | null): number {
  return created ? new Date(created).getTime() : 0;
}
function compareNewest(
  a: { ai_intro?: unknown; created_at?: string | null },
  b: { ai_intro?: unknown; created_at?: string | null },
): number {
  const ra = parseIntroReleaseDate(a.ai_intro);
  const rb = parseIntroReleaseDate(b.ai_intro);
  if (ra !== null && rb !== null) return rb - ra; // 둘 다 날짜 → 최신순
  if (ra !== null) return -1; // 날짜 있는 쪽 우선
  if (rb !== null) return 1;
  return createdMs(b.created_at) - createdMs(a.created_at); // 둘 다 없음 → 수집일 최신순
}

// ────────────────────────────────────────────
// 차트 기반 추천 (등록순 / 순위 상승·하락) — ISSUE-08
// ────────────────────────────────────────────
type ChartSort = NonNullable<
  Extract<ChatIntent, { intent: "recommend" }>["chart_sort"]
>;

// 모드별 곡 id 목록(정렬 순). recent_registered: 등록 최신순 / rank_up·down: 최신 차트 순위 이동폭 순.
async function getChartSortedSongIds(mode: ChartSort): Promise<string[]> {
  const supabase = createServerClient();

  if (mode === "recent_registered") {
    const { data, error } = await supabase
      .from("songs")
      .select("id")
      .eq("ai_status", "done")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map((r) => r.id);
  }

  // rank_up / rank_down — 가장 최근 차트일의 delta로 정렬 (UP: 양수 내림차순, DOWN: 음수 오름차순)
  const status = mode === "rank_up" ? "UP" : "DOWN";
  const { data: latestRow, error: e1 } = await supabase
    .from("rank_history")
    .select("chart_date")
    .order("chart_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (e1) throw e1;
  const latest = latestRow?.chart_date;
  if (!latest) return [];

  const { data: rhRows, error: e2 } = await supabase
    .from("rank_history")
    .select("karaoke_track_id, delta_value")
    .eq("chart_date", latest)
    .eq("delta_status", status)
    .order("delta_value", { ascending: mode === "rank_down" })
    .limit(50);
  if (e2) throw e2;

  const trackIds = (rhRows ?? []).map((r) => r.karaoke_track_id);
  if (trackIds.length === 0) return [];

  const { data: tracks, error: e3 } = await supabase
    .from("karaoke_tracks")
    .select("id, song_id")
    .in("id", trackIds);
  if (e3) throw e3;
  const trackToSong = new Map((tracks ?? []).map((t) => [t.id, t.song_id]));

  // rhRows 순서(이동폭 순) 유지 + 한 곡이 TJ/KY 둘 다면 dedup
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const r of rhRows ?? []) {
    const sid = trackToSong.get(r.karaoke_track_id);
    if (sid && !seen.has(sid)) {
      seen.add(sid);
      ids.push(sid);
    }
  }
  return ids;
}

const CHART_SORT_LEAD: Record<ChartSort, string> = {
  recent_registered: "최근 노래방에 등록된 곡이에요",
  rank_up: "요즘 순위가 오르는 곡이에요",
  rank_down: "최근 순위가 내려간 곡이에요",
};

async function handleChartRecommend(
  mode: ChartSort,
  excludeIds: string[] = [],
): Promise<Response> {
  const ids = (await getChartSortedSongIds(mode)).filter(
    (id) => !excludeIds.includes(id),
  );

  if (ids.length === 0) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message:
        excludeIds.length > 0
          ? "이 조건엔 더 이상 다른 곡이 없어요. 다른 걸로 물어봐 주세요."
          : "지금은 보여드릴 곡을 찾지 못했어요. 다른 걸로 시도해볼까요?",
    } satisfies ChatMessage);
  }

  // ids 순서(등록/이동폭 순)대로 완료(done)된 첫 곡 선택
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select(
      `
      id,
      karaoke_tracks (
        provider, karaoke_no, title_ko_jp,
        title_in_provider, artist_ko, artist_in_provider
      )
    `,
    )
    .in("id", ids)
    .eq("ai_status", "done");
  if (error) throw error;

  const byId = new Map((data ?? []).map((r) => [r.id, r]));
  const firstDone = ids.map((id) => byId.get(id)).find((r) => r != null);
  if (!firstDone) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message: "지금은 보여드릴 곡을 찾지 못했어요. 다른 걸로 시도해볼까요?",
    } satisfies ChatMessage);
  }

  const isInTop100 = await checkIsInTop100(firstDone.id);
  const song = buildSongField(
    firstDone.id,
    firstDone.karaoke_tracks ?? [],
    isInTop100,
  );

  return Response.json({
    type: "song_candidate" as const,
    role: "model" as const,
    song_id: firstDone.id,
    message: `${CHART_SORT_LEAD[mode]}! "${song.titleKo ?? song.titleInProvider}" 이 곡 어떠세요?`,
    song,
    intent: { intent: "recommend", chart_sort: mode },
  } satisfies ChatMessage);
}

// ────────────────────────────────────────────
// 핸들러: 추천
// ────────────────────────────────────────────
async function handleRecommend(
  intent: Extract<ChatIntent, { intent: "recommend" }>,
  excludeIds: string[] = [],
): Promise<Response> {
  // 차트 기반 모드(등록순·순위변동)는 전용 경로로
  if (intent.chart_sort) return handleChartRecommend(intent.chart_sort, excludeIds);

  const supabase = createServerClient();

  let query = supabase
    .from("songs")
    .select(
      `
    id,
    ai_intro,
    created_at,
    karaoke_tracks (
      provider, karaoke_no, title_ko_jp,
      title_in_provider, artist_ko, artist_in_provider
    )
  `,
    )
    .eq("ai_status", "done");

  // "최신곡"은 LLM 주관 라벨(ai_traits) 대신 발매/투고일 최신순 실데이터로 처리(아래 정렬).
  const wantNewest = intent.trait === "최신곡";
  if (intent.category) query = query.eq("ai_category", intent.category);
  if (intent.genre) query = query.contains("ai_genres", [intent.genre]);
  if (intent.vibe) query = query.contains("ai_vibes", [intent.vibe]);
  if (intent.trait && !wantNewest)
    query = query.contains("ai_traits", [intent.trait]);
  if (intent.vocal_difficulty === "easy")
    query = query.not("ai_vocal_score", "is", null).lte("ai_vocal_score", 2);
  if (intent.vocal_difficulty === "hard")
    query = query.not("ai_vocal_score", "is", null).gte("ai_vocal_score", 3);
  if (intent.pronunciation_difficulty === "easy")
    query = query
      .not("ai_pronunciation_score", "is", null)
      .lte("ai_pronunciation_score", 2);
  if (intent.pronunciation_difficulty === "hard")
    query = query
      .not("ai_pronunciation_score", "is", null)
      .gte("ai_pronunciation_score", 3);

  // 특정 가수로 한정된 추천 (옵션 좁히기: {가수 + 필터})
  if (intent.artist) {
    const artistIds = await getArtistSongIds(intent.artist);
    if (artistIds.length === 0) {
      return Response.json({
        type: "off_topic",
        role: "model",
        message: `"${intent.artist}" 가수의 곡을 찾지 못했어요.`,
      } satisfies ChatMessage);
    }
    query = query.in("id", artistIds);
  }

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }
  // 최신곡: 발매/투고일(ai_intro) 최신순, 없으면 created_at 폴백. "다른 거"는 excludeIds로 다음 곡.
  //  (풀을 받아 JS에서 정렬 — 날짜가 jsonb 자유형이라 SQL 정렬 대신 파싱.)
  // 그 외: 조건 풀 20개에서 랜덤 1곡.
  if (wantNewest) query = query.order("created_at", { ascending: false });
  const { data } = await query.limit(wantNewest ? 200 : 20);

  if (!data || data.length === 0) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message:
        excludeIds.length > 0
          ? "이 조건엔 더 이상 다른 곡이 없어요. 다른 분위기나 장르로 물어봐 주세요."
          : "조건에 맞는 곡을 찾지 못했어요. 다른 분위기나 장르로 시도해볼까요?",
    } satisfies ChatMessage);
  }

  const picked = wantNewest
    ? [...data].sort(compareNewest)[0]
    : data[Math.floor(Math.random() * data.length)];

  const isInTop100 = await checkIsInTop100(picked.id);
  const song = buildSongField(
    picked.id,
    picked.karaoke_tracks ?? [],
    isInTop100,
  );

  return Response.json({
    type: "song_candidate" as const,
    role: "model" as const,
    song_id: picked.id,
    message: `"${song.titleKo ?? song.titleInProvider}" 이 곡은 어떠세요?`,
    song,
    intent,
  } satisfies ChatMessage);
}

// ────────────────────────────────────────────
// CORS — 토스 미니앱 웹뷰(*.tossmini.com) + 로컬 개발만 허용.
//  공개 데이터라 CSRF 위험은 낮으나 비용(Gemini) 남용 표면을 줄이려 오리진 화이트리스트로 좁힘.
//  실제 웹뷰 오리진: https://<appName>.apps.tossmini.com(실제) / .private-apps.tossmini.com(테스트).
//  추가 허용 도메인은 CHAT_ALLOWED_ORIGINS(콤마 구분 env)로.
// ────────────────────────────────────────────
function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    // 토스 미니앱 웹뷰 (apps / private-apps 등 모든 서브도메인)
    if (hostname === "tossmini.com" || hostname.endsWith(".tossmini.com")) {
      return true;
    }
    // 로컬 개발
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    // env 추가 허용(웹 배포 도메인 등)
    const extra = (process.env.CHAT_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return extra.includes(origin);
  } catch {
    return false;
  }
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  // 허용 오리진만 반사(reflect). 그 외엔 ACAO 미설정 → 브라우저가 차단.
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function corsify(res: Response, origin: string | null): Response {
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    headers.set(key, value);
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

// 브라우저 preflight
export function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

// ────────────────────────────────────────────
// POST /api/chat
// ────────────────────────────────────────────
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  return corsify(await handleChat(req), origin);
}

function getErrorStatus(e: unknown): number | undefined {
  if (e === null || typeof e !== "object") return undefined;
  if ("status" in e && typeof (e as { status: unknown }).status === "number") {
    return (e as { status: number }).status;
  }
  const resp = (e as { response?: unknown }).response;
  if (
    resp !== null &&
    typeof resp === "object" &&
    "status" in resp &&
    typeof (resp as { status: unknown }).status === "number"
  ) {
    return (resp as { status: number }).status;
  }
  return undefined;
}

// 요청 본문 정규화 상수 — 신뢰할 수 없는 클라 입력을 서버에서 제한.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LEN = 200; // 클라 입력 상한과 동일
const MAX_EXCLUDE_IDS = 100;
const MAX_HISTORY_TURNS = 12;
const MAX_TURN_TEXT_LEN = 500;

// "다른 거/곡/노래", "딴 거", "또", "다음", "하나 더", "더 추천", "아니에요" 등 = 직전 검색을 이어가는 연속 요청.
function isContinuationMessage(msg: string): boolean {
  const t = msg.trim();
  // 부정("아니에요/아니요/아니야/아님")은 그 자체로 끝날 때만 = 다음 후보 요청.
  //  ("아니메(애니메) 노래"처럼 '아니'로 시작하는 검색어 오탐 방지 위해 종료 경계 요구)
  if (/^(아니(에요|여|요|야)?|아님)\s*$/.test(t)) return true;
  return /^(다른\s*(거|것|곡|노래)|딴\s*(거|것|곡|노래)|또(\s|$|다른|추천)|다음\s*(거|곡|노래)?|하나\s*더|더\s*(추천|없|줘|들려))/.test(
    t,
  );
}

async function handleChat(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as {
      message?: unknown;
      history?: unknown;
      excludeIds?: unknown;
      lastIntent?: ChatIntent;
      continuation?: unknown;
    };

    // 신뢰할 수 없는 요청 본문 → 타입·길이·형식을 정규화한 값만 사용.
    if (typeof body.message !== "string" || body.message.trim().length === 0) {
      return Response.json({
        type: "off_topic",
        role: "model",
        message: "노래 검색이나 추천에 대해 물어봐 주세요!",
      } satisfies ChatMessage);
    }
    const message = body.message.trim().slice(0, MAX_MESSAGE_LEN);
    // 제외 ID는 SQL 필터 문자열에 들어가므로 UUID 형식만 통과시킴(주입 방지).
    const exclude = (Array.isArray(body.excludeIds) ? body.excludeIds : [])
      .filter((id): id is string => typeof id === "string" && UUID_RE.test(id))
      .slice(0, MAX_EXCLUDE_IDS);
    const history: ChatTurn[] | undefined = Array.isArray(body.history)
      ? body.history
          .filter(
            (t): t is ChatTurn =>
              !!t && typeof (t as ChatTurn).text === "string",
          )
          .slice(-MAX_HISTORY_TURNS)
          .map((t) => ({
            role: t.role === "user" ? "user" : "model",
            text: String(t.text).slice(0, MAX_TURN_TEXT_LEN),
          }))
      : undefined;
    const lastIntent = body.lastIntent;
    const continuation = body.continuation === true;

    const easter = checkEasterEgg(message);
    if (easter) return Response.json(easter);

    // "다른 거"류 연속 요청은 LLM에 맡기지 않고 직전 인텐트를 그대로 재사용(제외목록으로 다른 곡).
    // 그 외에는 Gemini로 분류(history 맥락 포함).
    const isContinue = continuation === true || isContinuationMessage(message);
    const intent: ChatIntent =
      isContinue && lastIntent && lastIntent.intent !== "unknown"
        ? lastIntent
        : await extractIntent(message, history);

    switch (intent.intent) {
      case "search_song":
        return handleSearchSong(intent.keyword, exclude);
      case "search_artist":
        return handleSearchArtist(intent.keyword, exclude);
      case "recommend":
        return handleRecommend(intent, exclude);
      case "unknown":
      default:
        return Response.json({
          type: "off_topic",
          role: "model",
          message: "노래 검색이나 추천에 대해 물어봐 주세요!",
        } satisfies ChatMessage);
    }
  } catch (e) {
    console.error("[chat] error:", e);

    const status = getErrorStatus(e);
    const is429 = status === 429;
    const is5xx = status !== undefined && status >= 500;

    return Response.json(
      {
        type: "error",
        role: "model",
        message: is429
          ? "AI 요청 한도를 초과했어요. 잠시 후 다시 시도해주세요 🥺"
          : is5xx
            ? "AI 서버가 잠시 붐벼요. 잠시 후 다시 시도해주세요 🙏"
            : "서버 오류가 발생했어요. 다시 시도해주세요.",
      } satisfies ChatMessage,
      { status: is429 ? 429 : is5xx ? 503 : 500 },
    );
  }
}
