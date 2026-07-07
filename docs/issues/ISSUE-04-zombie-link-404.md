---
id: ISSUE-04
title: TOP100 좀비 링크 404
cycle: 4
priority: P1
status: 해결됨
labels: [bug, ux, query]
created: 2026-07-02
related: [ISSUE-01]
---

# ISSUE-04 · TOP100 좀비 링크 404

## 1. 요약 (TL;DR)

TOP100 리스트 쿼리에는 `ai_status` 필터가 없어 `pending` 곡도 리스트에 노출되는데,
상세 페이지 쿼리는 `ai_status='done'`만 조회한다. 그 결과 pending 곡은
**리스트엔 보이지만 클릭하면 404**가 되는 "좀비 링크"가 된다.

## 2. 증상 (Symptoms)

- 2026-07-02 기준 TOP100의 77위(`チューリングラブ`), 95위(`サクラキミワタシ`, 둘 다 NEW·pending)
  클릭 시 상세로 넘어가지 않음.

## 3. 근본 원인 분석 (Root Cause)

- `karachato/src/lib/chart/queries.ts` `getChartByProvider` — `ai_status` 필터 **없음** → pending 곡도 리스트에 포함.
- `karachato/src/lib/song/queries.ts` `getSongById` — `.eq("ai_status","done")` 있음 → pending은 `null` 반환.
- `karachato/src/app/song/[id]/page.tsx` — `null`이면 `notFound()` → 404.
- `karachato/src/components/chart/RankCard/index.tsx` — 모든 곡을 `href={/song/${songId}}`로 무조건 링크(조건 없음).
- 캐싱 원인 아님(`generateStaticParams`/`revalidate` 없음, 동적 렌더).

## 4. 근본 vs 표면

- 근본 트리거는 [ISSUE-01](ISSUE-01-translation-batch-index-shift.md)로 pending이 쌓이는 것.
  01~03 해결 시 현재 증상은 대부분 사라진다.
- 그러나 **미래 신규곡은 크롤 직후 항상 잠깐 pending**이므로, 필터 정합성 자체를 고쳐 재발을 막아야 한다.

## 5. 해결 방안 (Proposed Fix) — 택1/조합

1. **리스트에서 pending 제외** — `getChartByProvider`에 `songs.ai_status='done'` 필터 추가.
   - 트레이드오프: 갓 진입한 NEW 곡이 번역 완료 전까지 순위에서 잠깐 빠짐(차트 정확도 손상).
2. **상세를 pending도 열어주기** — done 필터 완화하고, 미번역 시 원문 + "번역 준비중" 플레이스홀더 표시.
   - 사용자 경험상 더 자연스러움(순위 유지 + 클릭 가능). 권장.
3. **링크 가드** — pending 곡은 카드에서 링크 비활성 + "준비중" 표시.

→ 권장: **2번**(상세가 pending도 원문으로 열림) + 신규곡 번역 지연 최소화([ISSUE-01](ISSUE-01-translation-batch-index-shift.md)).

## 6. 해결 로그 (Resolution Log)

> 상태: **해결됨 (2026-07-02).** 방식: 조건부 상세(2번안).

### 조치 (Actions)
- `lib/song/queries.ts` `getSongById`: `.eq("ai_status","done")` 제거, `ai_status` 컬럼 조회 추가 → pending 곡도 조회.
- `app/song/[id]/page.tsx`: 상태 분기 추가 — `null`→`notFound()`, `pending`→`SongPendingNotice`, `done`→기존 상세. `generateMetadata`도 pending 시 원문(`title_in_provider`)으로 폴백.
- `components/song-detail/SongPendingNotice.tsx` 신규: 상단에 원문 제목/가수(상세와 동일 배치), 남는 영역 중앙에 모래시계 아이콘 + "곡 정보를 준비하고 있어요. / 곧 만나요!" (검색 빈 상태와 동일 톤).
- `types/database.ts` `SongDetailRow`에 `ai_status` 추가.

### 결과 (Outcome)
- pending 곡 클릭 시 404 대신 '준비중' 화면 표시. 신규곡이 크롤 직후 잠깐 pending인 창의 좀비 링크 404를 방지.
- 근본 트리거(pending 축적)는 MNT-1(ISSUE-01~03)에서 이미 해소.

### 검증 (Verification)
- 임시 pending 곡(`Unravel / TK From 린토시테시구레`)으로 로컬 dev 렌더 확인: HTTP 200, 준비중 UI 정상 표시, 404/Turbopack 에러 없음. 검증 후 done 복구 완료.

### 관련 커밋/PR
- 브랜치 `fix/zombie-link-404-guard`, 커밋 `e23a83f`.
