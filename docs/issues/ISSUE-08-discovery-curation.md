---
id: ISSUE-08-discovery-curation
title: 탐색/큐레이션 — 카테고리·신규곡·가수별 둘러보기
cycle: 출시 후 (기능 강화)
priority: P3
status: 진행중
labels: [feature, discovery, ux, curation]
related: [EPIC-apps-in-toss-migration, ISSUE-07]
created: 2026-07-05
---

# ISSUE-08 · 탐색/큐레이션 (카테고리·신규곡·가수별 둘러보기)

## 1. 배경 / 동기

현재 앱 진입점은 **TOP100 차트 + 검색 + 챗봇**뿐이다. 원하는 곡을 "이미 아는" 사용자에겐 충분하나,
**둘러보다 발견하는** 경험이 없다. 차트 100위 밖의 곡·특정 취향(보컬로이드/애니)·신규 유입곡은 사실상 도달 불가.
→ 탐색(브라우즈) 레이어를 얹어 발견성과 체류를 높인다.

## 2. 아이디어와 데이터 근거

핵심: **필요한 데이터가 대부분 이미 DB에 있다.**

| 기능 | 데이터 소스 | 상태 |
|---|---|---|
| **카테고리별** (보컬로이드/애니 OST/극장판/게임/JPOP) | `songs.ai_category` | ✅ 존재 + 챗봇 recommend가 이미 이 컬럼으로 필터 |
| **장르/분위기/특성** (시티팝·신나는·역주행·바이럴·커버…) | `songs.ai_genres`·`ai_vibes`·`ai_traits` | ✅ 존재 |
| **신규 곡 — 차트 신규 진입** | `rank_history.delta_status = 'NEW'` | ✅ 이미 계산·저장(차트 카드에 NEW 뱃지 노출 중) |
| **신규 곡 — DB 신규 등록** | `songs.created_at` (+ `updated_at`) | ✅ 존재 확인됨 (timestamptz) |
| **가수별 모음** | `songs.artist_ko`/`artist_ko_norm` | ✅ 존재(검색·챗봇 search_artist와 겹침) |

## 3. UX 방향 (초안)

- **TOP100 차트는 메인 유지** (앱 정체성). 상단 탭에 전부 밀어넣지 않는다.
- 후보 A: **"탐색" 화면 신설** — 필터 칩(보컬로이드·애니·신나는·신규…) + 가수별 진입.
- 후보 B: **홈 큐레이션 row** — "🆕 오늘의 신규", "🎤 보컬로이드 모음" 등 가로 스크롤 섹션.
- **가수별**은 "가수 상세 페이지"(그 가수 곡 전부) 형태가 검색과 자연스럽게 연결됨.

## 4. 열린 질문

- ~~`songs.created_at` 존재 여부~~ → **확인됨: `created_at`·`updated_at`(timestamptz) 존재.** "DB 신규 등록" 구현 가능.
- 탐색 진입: 별도 탭 vs 홈 큐레이션 vs 검색 화면 확장 중 무엇?
- "신규"의 기준: 차트 신규 진입(delta NEW) vs DB 등록일 vs 둘 다.

## 5. 우선순위 / 선행

- **선행:** 앱인토스 마이그레이션(EPIC) 출시 + 3차(ISSUE-05 금영 → 06 → 07) 이후.
- 데이터가 대부분 준비돼 있어 **구현 비용은 낮은 편**(주로 화면/쿼리 작업).

## 6. 챗봇 추천 옵션으로 확장 (ISSUE-07 연계)

> 탐색 "화면"과 별개로, **챗봇 recommend 옵션 + 퀵버튼**으로도 같은 데이터를 노출하자는 방향.
> ISSUE-07에서 "신곡=발매/투고일"을 구현하며 파생된 아이디어. **이번 출시 브랜치 밖(다음 이슈)으로 결정.**

### 개념 분리 (3개 축은 서로 다른 질문)
- **발매/투고일** (`ai_intro`의 발매일·투고일) = 원곡이 나온 날 → **"요즘 나온 신곡"**. → **ISSUE-07에서 구현됨**(trait 최신곡, 발매일 최신순 정렬).
- **등록일** (`songs.created_at`) = 노래방/우리 차트에 잡힌 날 → **"최근 노래방에 등록된 곡"**. (발매일과 혼용 금지 — 정렬 오염됨)
- **순위 변동** (`rank_history.delta_status`/`delta_value`) = **"요즘 뜨는/지는 곡"**. ai_traits "바이럴" 주관 라벨보다 정확.

### 실현가능성 (2026-07-06 확인)
- 최신 차트일 `2026-07-06`. 그날 기준 **UP 27 / DOWN 34 / SAME 38 / NEW 1**, `delta_value`(이동 계단 수) 모두 채워짐.
- `created_at`은 하루 1~5곡씩 **증분 수집**(백필 클러스터 아님) → 등록순 정렬에 적합.

### 구현 스케치
- recommend 인텐트에 모드 필드 추가(예: `chart_sort?: "recent_registered" | "rank_up" | "rank_down"`).
- 프롬프트 규칙: "최근 노래방에 등록된/들어온 곡"→recent_registered, "순위 오른/뜨는"→rank_up, "순위 내린/지는"→rank_down.
- 핸들러: recent_registered → `created_at DESC`; rank_up/down → `rank_history` 최신일 + `delta_status` UP/DOWN + `delta_value` 순, track→song 매핑·dedup.
- 퀵버튼으로 노출("최근 노래방에 등록된 곡", "요즘 순위 오른 곡").

## 해결 로그

### §6 챗봇 추천 옵션 1차 구현 (feat/chat-chart-options)
- **조치**: recommend 인텐트에 `chart_sort`(recent_registered/rank_up/rank_down) 추가. `handleChartRecommend`로
  등록순(`created_at DESC`)·순위 상승/하락(`rank_history` 최신일 `delta_value` 순)을 실데이터로 정렬. 프롬프트 규칙 +
  퀵버튼("요즘 순위 오른 곡", "최근 노래방에 등록된 곡") 노출.
- **검증**(2026-07-06, 결정론 continuation): 등록순→모시모시?(최신 등록), 순위상승→모시모시?(+10)·#2 푸르름이 사는 곳(+6),
  순위하락→튜링 러브(-6). DB 정답과 일치. Gemini 분류(퀵버튼 문구)는 쿼터 회복 후 라이브 확인.
- **남은 것**: 탐색 화면(브라우즈 레이어)·카테고리/가수별 큐레이션은 미착수(출시 후).
