import { createServerClient } from "@/lib/supabase/server";
import { extractIntent } from "@/lib/gemini/intent";
import { getToday } from "@/utils/date";

import type { ChatMessage, SongCandidateMessage } from "@/types/chat";
import type { ChatIntent } from "@/types/gemini";

import { ARTIST_KO_MAP } from "@/constants/chat";

// ────────────────────────────────────────────
//  전처리 (Gemini 호출 전, API 쿼터 미소모)
// ────────────────────────────────────────────
function checkEasterEgg(message: string): ChatMessage | null {
  const t = message.trim().toLowerCase();
  if (["안녕", "hi", "hello", "안녕하세요", "ㅎㅇ", "gd"].includes(t)) {
    return {
      type: "text",
      role: "model",
      message: "안녕하세요! 찾고 싶은 곡이나 가수가 있으신가요? 😊",
    };
  }

  const traceUKeywords = [
    "트유",
    "트레이스 유",
    "트레이스유",
    "traceu",
    "trace u",
  ];

  if (traceUKeywords.some((kw) => t.includes(kw))) {
    return {
      type: "text",
      role: "model",
      message: "고마워, 행복하자.",
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
async function handleSearchSong(keyword: string): Promise<Response> {
  const supabase = createServerClient();

  const { data } = await supabase
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
    .or(`title_ko_norm.ilike.%${keyword}%,title_norm.ilike.%${keyword}%`)
    .eq("ai_status", "done")
    .limit(1)
    .maybeSingle();

  if (!data) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message: `"${keyword}" 곡을 찾지 못했어요. 제목을 다시 확인해볼까요?`,
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
  } satisfies ChatMessage);
}

// ────────────────────────────────────────────
// 핸들러: 가수명 검색
// ────────────────────────────────────────────
async function handleSearchArtist(keyword: string): Promise<Response> {
  const supabase = createServerClient();

  const reverseMap = Object.entries(ARTIST_KO_MAP).find(
    ([, ko]) => ko === keyword,
  );
  const originalKeyword = reverseMap ? reverseMap[0] : null;

  const orCondition = [
    `artist_ko_norm.ilike.%${keyword}%`,
    `artist_norm.ilike.%${keyword}%`,
    originalKeyword ? `artist_norm.ilike.%${originalKeyword}%` : null,
  ]
    .filter(Boolean)
    .join(",");

  const { data } = await supabase
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
    .or(orCondition)
    .eq("ai_status", "done")
    .limit(1)
    .maybeSingle();

  if (!data) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message: `"${keyword}" 가수의 곡을 찾지 못했어요.`,
    } satisfies ChatMessage);
  }

  const isInTop100 = await checkIsInTop100(data.id);
  const song = buildSongField(data.id, data.karaoke_tracks ?? [], isInTop100);

  return Response.json({
    type: "song_candidate" as const,
    role: "model" as const,
    song_id: data.id,
    message: `"${song.titleKo ?? song.titleInProvider}" 이 곡은 어떠세요?`,
    song,
  } satisfies ChatMessage);
}

// ────────────────────────────────────────────
// 핸들러: 추천
// ────────────────────────────────────────────
async function handleRecommend(
  intent: Extract<ChatIntent, { intent: "recommend" }>,
): Promise<Response> {
  const supabase = createServerClient();

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
    .eq("ai_status", "done");

  if (intent.category) query = query.eq("ai_category", intent.category);
  if (intent.genre) query = query.contains("ai_genres", [intent.genre]);
  if (intent.vibe) query = query.contains("ai_vibes", [intent.vibe]);
  if (intent.trait) query = query.contains("ai_traits", [intent.trait]);

  const { data } = await query.limit(1).maybeSingle();

  if (!data) {
    return Response.json({
      type: "off_topic",
      role: "model",
      message:
        "조건에 맞는 곡을 찾지 못했어요. 다른 분위기나 장르로 시도해볼까요?",
    } satisfies ChatMessage);
  }

  const isInTop100 = await checkIsInTop100(data.id);
  const song = buildSongField(data.id, data.karaoke_tracks ?? [], isInTop100);

  return Response.json({
    type: "song_candidate" as const,
    role: "model" as const,
    song_id: data.id,
    message: `"${song.titleKo ?? song.titleInProvider}" 이 곡은 어떠세요?`,
    song,
  } satisfies ChatMessage);
}

// ────────────────────────────────────────────
// POST /api/chat
// ────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const easter = checkEasterEgg(message);
    if (easter) return Response.json(easter);

    const intent = await extractIntent(message);

    switch (intent.intent) {
      case "search_song":
        return handleSearchSong(intent.keyword);
      case "search_artist":
        return handleSearchArtist(intent.keyword);
      case "recommend":
        return handleRecommend(intent);
      case "unknown":
      default:
        return Response.json({
          type: "off_topic",
          role: "model",
          message: "노래 검색이나 추천에 대해 물어봐 주세요!",
        } satisfies ChatMessage);
    }
  } catch {
    return Response.json(
      {
        type: "error",
        role: "model",
        message: "서버 오류가 발생했어요. 다시 시도해주세요.",
      } satisfies ChatMessage,
      { status: 500 },
    );
  }
}
