# GitHub 업로드용 이슈 본문 (복붙용)

아래 7개를 GitHub → New Issue(🔍 시스템 이슈 분석 리포트 템플릿)에 순서대로 붙여넣으면 된다.
각 이슈의 **제목 / 라벨 / 추천 브랜치명 / 본문**을 그대로 복사.
관련 이슈는 `ISSUE-NN` 표기로 두었으니, GitHub 업로드 후 실제 이슈 번호(`#N`)로 바꾸면 자동 링크된다.

## 브랜치명 요약

| # | 이슈 | 추천 브랜치명 | 라벨 |
|---|------|--------------|------|
| 01 | 번역 배치 인덱스 시프트 버그 | `fix/translation-batch-index-shift` | `bug`, `P0`, `data-integrity` |
| 02 | 고아 song 레코드 | `fix/orphan-song-records` | `bug`, `P0`, `data-integrity` |
| 03 | 오염 번역 데이터 복구 | `chore/translation-data-recovery` | `P0`, `data-integrity` |
| 04 | TOP100 좀비 링크 404 | `fix/zombie-link-404` | `bug`, `P1`, `ux` |
| 05 | 금영(KY) 크롤러 부활 | `feat/ky-crawler-revival` | `enhancement`, `P2`, `crawler` |
| 06 | 가수 번역명 일관성 | `feat/artist-name-consistency` | `enhancement`, `P2` |
| 07 | 챗봇 지능형 검색 재설계 | `feat/chatbot-fuzzy-search` | `enhancement`, `P3`, `chatbot` |

> 브랜치 컨벤션: 데이터/동작을 바로잡는 것은 `fix/`, 복구·정리성 작업은 `chore/`, 신규·개선은 `feat/`.

---

# ISSUE-01

**제목:** `[ISSUE] 번역 배치 인덱스 시프트 버그 — 번역 오연결 + 신규곡 pending 잔존`
**라벨:** `bug` `P0` `data-integrity` **| 브랜치:** `fix/translation-batch-index-shift`

## 요약 (TL;DR)
단일 버그가 세 증상을 유발한다. 배치 번역 결과 매핑에서 `results[input.index]`로 접근하는데, `translateSongBatch`는 입력 배열의 물리적 순서대로 결과를 반환한다. 트랙 0개인 고아 곡(ISSUE-02)이 배치에서 `continue`로 빠지면 물리 인덱스와 `input.index`가 어긋나, (1) 번역이 인접 다음 곡에 잘못 저장되고 (2) 체인 끝 곡은 undefined가 되어 pending에 영구 잔존한다.

## 증상 (Symptoms)
- 번역이 한 칸씩 밀려 저장됨(각 곡에 "다음 곡"의 번역): `可愛くてごめん/honeyworks` → `벚꽃 너 나/tuki.`, `ヒッチコック/ヨルシカ` → `튜링 러브/나나오 아카리` 등.
- 신규 진입곡이 계속 pending (2026-07-02: `チューリングラブ` 77위, `サクラキミワタシ` 95위).
- 3월 등록 곡은 정상 → 고아 곡 등장 이후 배치부터 오염.

## 근본 원인 분석 (Root Cause)
- `src/lib/gemini/translate.ts:246-255` — `translateSongBatch`가 입력 순서 배열 반환(find로 index 매핑은 맞음).
- `src/lib/ai/process.ts:58-61` — 트랙 0개 곡을 batchInputs에서 `continue`로 제외.
- `src/lib/ai/process.ts:88-96` — 결과를 `results[input.index]`(원래 chunk 순번 j)로 접근 → 물리 인덱스와 불일치, 끝 곡은 undefined.
- `processArtistKo`(process.ts:289~)에도 동일 버그.
- 근거: `gemini-2.5-flash`에 실제 pending 곡 배치 호출 시 HTTP 200·정상 번역 확인 → 모델 아닌 코드 버그 확정.

## 영향 범위 (Impact)
- `songs`/`karaoke_tracks`의 번역 컬럼 + `_norm` 파생까지 오염. done 143곡 중 다수 의심 → 전수 재검증 필요(ISSUE-03). 검색·차트·상세·챗봇 전부 잘못된 번역 노출.

## 해결 방안 (Proposed Fix)
1. 매핑을 index 기준으로 정합화: `translateSongBatch`가 index→result 맵 반환 후 `map.get`으로 접근, 또는 process에서 반환 배열을 순서대로 zip.
2. `processArtistKo`도 동일 수정.
3. 수정 후 ISSUE-03 복구 실행.
4. (예방) ISSUE-02 고아 레코드가 batchInputs 흐름에 섞이지 않도록 상류 차단.

## 우선순위 / 사이클
- 우선순위: **P0** · 사이클: **1** · 관련: ISSUE-02 ISSUE-03 ISSUE-04
- 상세: `docs/issues/ISSUE-01-translation-batch-index-shift.md`

---

# ISSUE-02

**제목:** `[ISSUE] 고아 song 레코드(트랙 0개) & 중복 삽입`
**라벨:** `bug` `P0` `data-integrity` **| 브랜치:** `fix/orphan-song-records`

## 요약 (TL;DR)
같은 곡이 `title_norm` 정규화 불일치로 중복 삽입되며 `karaoke_tracks`가 하나도 없는 고아 song이 생긴다. 이 곡은 번역 배치에서 건너뛰어져 영구 pending이 되고, 동시에 ISSUE-01의 인덱스 시프트를 유발하는 트리거가 된다.

## 증상 (Symptoms)
- 트랙 0개 pending 곡(2026-07-02, 2곡): `かわいいだけじゃ だめですか/cutie street`(2026-05-28), `革命道中 on the way/アイナ・ジ・エンド`(2026-05-28). 둘 다 updated_at이 생성 시점 그대로.

## 근본 원인 분석 (Root Cause)
- 동일 곡이 표기 차이로 별도 삽입: `革命道中on the way`(3/30, 트랙 있음, 정상) vs `革命道中 on the way`(5/28, 공백 하나 차이, 트랙 0개, 고아).
- `title_norm`+`artist_norm` 중복 감지가 표기 차이를 흡수 못 함.
- 트랙 없는 song 삽입 경로 점검 필요: `src/app/api/cron/route.ts`, `src/lib/crawlers/*`, `src/utils/string.ts`(`normalize`).

## 영향 범위 (Impact)
- 고아 곡: 영구 pending, 빈 데이터 노출 위험. 배치 전체: ISSUE-01의 오연결·pending 잔존 촉발.

## 해결 방안 (Proposed Fix)
1. `normalize` 강화(연속 공백/전각·반각/대소문자 통일)로 중복 감지 신뢰도 향상.
2. 기존 고아 레코드 정리(병합/삭제, 참조 무결성 확인 후).
3. 삽입 방어: 트랙과 song을 원자적으로 함께 생성, 트랙 없는 song 생성 차단.
4. (완화) ISSUE-01 매핑 수정 병행.

## 우선순위 / 사이클
- 우선순위: **P0** · 사이클: **2** · 관련: ISSUE-01 ISSUE-03
- 상세: `docs/issues/ISSUE-02-orphan-song-records.md`

---

# ISSUE-03

**제목:** `[ISSUE] 오염 번역 데이터 복구 (재번역)`
**라벨:** `P0` `data-integrity` **| 브랜치:** `chore/translation-data-recovery`

## 요약 (TL;DR)
ISSUE-01로 밀려 저장된 번역본을 바로잡는다. SQL로 시프트를 되돌리는 방식은 위험하므로, 버그 수정 후 오염 곡을 재번역하는 방식으로 복구한다.

## 배경 (Context)
- 번역본은 `songs`(title_ko, title_ko_norm, artist_ko, artist_ko_norm, description, ai_*)와 `karaoke_tracks`(title_ko_jp, title_ko_full, artist_ko) 두 테이블에 분산.
- 화면별 사용 컬럼이 다름 — 상세: songs / 리스트·검색표시: karaoke_tracks / 검색매칭: songs `_norm`(pg_trgm) + kt(ILIKE). 자동 전파 트리거 없음.

## 복구 방안 (Proposed Approach)
- **권장(재번역)**: ISSUE-01 수정 + ISSUE-02 정리 후, 오염 의심 곡을 `ai_status='pending'`으로 리셋 → `/api/cron-ai` 재실행 → 전 컬럼(`_norm` 포함) 재생성. 범위: title_norm↔title_ko 불일치 + 고아곡 등장(~2026-05-28) 이후 곡, 또는 안전하게 전 done 재번역 검토.
- **비권장(SQL 시프트 되돌리기)**: 시프트 폭이 배치마다 달라 경계 불명확, 더 꼬일 위험.

## 실행 주체
- Supabase(`twuqhafcssezckrbtkoo`)에 직접 리셋/재번역 실행 가능(승인 후). SQL Editor 수작업 불필요.

## 우선순위 / 사이클
- 우선순위: **P0** · 사이클: **3** · 관련: ISSUE-01 ISSUE-02
- 상세: `docs/issues/ISSUE-03-translation-data-recovery.md`

---

# ISSUE-04

**제목:** `[ISSUE] TOP100 좀비 링크 404 — 리스트/상세 ai_status 필터 불일치`
**라벨:** `bug` `P1` `ux` **| 브랜치:** `fix/zombie-link-404`

## 요약 (TL;DR)
TOP100 리스트 쿼리엔 `ai_status` 필터가 없어 pending 곡도 노출되는데, 상세 쿼리는 `ai_status='done'`만 조회한다. 그래서 pending 곡은 리스트엔 보이지만 클릭하면 404가 되는 좀비 링크가 된다.

## 증상 (Symptoms)
- 2026-07-02 TOP100의 77위(`チューリングラブ`), 95위(`サクラキミワタシ`, 둘 다 NEW·pending) 클릭 시 상세로 안 넘어감.

## 근본 원인 분석 (Root Cause)
- `src/lib/chart/queries.ts` `getChartByProvider` — ai_status 필터 없음(pending도 포함).
- `src/lib/song/queries.ts` `getSongById` — `.eq("ai_status","done")` → pending은 null.
- `src/app/song/[id]/page.tsx` — null이면 `notFound()` → 404.
- `src/components/chart/RankCard/index.tsx` — 모든 곡 무조건 `/song/${songId}` 링크.

## 근본 vs 표면
- 근본 트리거는 ISSUE-01(pending 축적). ISSUE-01~03 해결 시 현 증상은 대부분 사라짐. 단 신규곡은 크롤 직후 항상 잠깐 pending이므로 필터 정합성 자체를 고쳐 재발 방지 필요.

## 해결 방안 (Proposed Fix)
1. 리스트에서 pending 제외(차트 정확도 손상 트레이드오프).
2. **(권장)** 상세를 pending도 열어주기 — 미번역 시 원문 + "번역 준비중" 표시.
3. pending 곡 카드 링크 비활성 + "준비중" 표시.

## 우선순위 / 사이클
- 우선순위: **P1** · 사이클: **4** · 관련: ISSUE-01
- 상세: `docs/issues/ISSUE-04-zombie-link-404.md`

---

# ISSUE-05

**제목:** `[ISSUE] 금영(KY) 크롤러 부활 — "크롤 불가" 전제는 낡음, 현재 수집 가능`
**라벨:** `enhancement` `P2` `crawler` **| 브랜치:** `feat/ky-crawler-revival`

## 요약 (TL;DR)
"금영 크롤 불가"는 현재 틀렸다. 구 도메인 `karaokeyou.com`은 소멸했고, `kygabang.com`은 Node.js fetch로 정상 접근된다. 탭 제거가 아니라 크롤러를 되살리면 된다. 인프라(DB 스키마, 공통 파이프라인, 폴백 TODO)는 이미 준비됨.

## 검증 결과 (2026-07-02 실측)
- `karaokeyou.com` → DNS 소멸.
- `https://kygabang.com/chart/new_jpop.php` → Node.js fetch 200 OK, 리다이렉트 없음(258KB). 서버사이드 렌더링, 구 셀렉터 유효(`td.ch_daily_01/03/04 a.opbt/05`). 페이지당 20곡, `?page=1~5`로 TOP100 전체. 예: 곡번호 44438 / `Official髭男dism`, `優里`, `tuki.`.

## 해결 방안 (Proposed Fix)
1. `ky.ts` 복원 → 도메인/URL `kygabang.com` 교체, `?page=1~5` 순회.
2. `src/app/api/cron/route.ts`에 KY 파이프라인 연결(`processCrawledSongs` 재사용).
3. `KaraokeTabs`의 "준비중" 토스트 제거 → 정상 라우팅.
4. `src/lib/youtube/process.ts`의 KY 폴백 TODO 구현(금영 썸네일 미제공).
5. README 금영 서술 정정.

## 리스크
- 금영 썸네일 미제공 → 유튜브 폴백 의존. 사이트 구조 변경 대비 셀렉터 회귀 테스트. ISSUE-02 선행 권장.

## 우선순위 / 사이클
- 우선순위: **P2** · 사이클: **5**
- 상세: `docs/issues/ISSUE-05-ky-crawler-revival.md`

---

# ISSUE-06

**제목:** `[ISSUE] 가수 번역명 일관성 — 기존 artist_ko 재사용`
**라벨:** `enhancement` `P2` **| 브랜치:** `feat/artist-name-consistency`

## 요약 (TL;DR)
번역 배치가 매 곡마다 가수명을 독립적으로 새로 번역하고 기존 `artist_ko`를 참조하지 않아, 같은 가수인데 곡마다 표기가 흔들린다. 기존 번역명을 재사용해 일관성을 확보한다.

## 증상 (Symptoms)
- 동일 `artist_norm`에 다른 `artist_ko` 혼재: `Official髭男dism` → `Official髭男dism`/`Official히게단디즘`/`오피셜히게단디즘`; `優里` → `유우리`/`유리`.

## 근본 원인 분석 (Root Cause)
- `src/lib/gemini/translate.ts` — 프롬프트에 기존 번역 컨텍스트 없음.
- `src/lib/ai/process.ts` — 번역 전 기존 artist_ko 조회/주입 없음.

## 해결 방안 (Proposed Fix)
1. **(권장)** 번역 전 해당 `artist_norm`의 기존 `artist_ko`가 있으면 재번역 없이 그대로 대입(결정적, LLM 호출 절감).
2. 프롬프트에 "기존 번역: X — 동일 사용" 주입(유연하나 흔들 여지).
- 가수명은 1번, 곡 제목/설명은 기존 유지.

## 의존성
- ISSUE-01/ISSUE-03로 오염 정리 후라야 기존 artist_ko가 신뢰 가능한 재사용 소스가 됨. ISSUE-05(금영 유입) 전 반영 시 신규 KY 곡부터 일관 저장.

## 우선순위 / 사이클
- 우선순위: **P2** · 사이클: **6** · 관련: ISSUE-01 ISSUE-03
- 상세: `docs/issues/ISSUE-06-artist-name-consistency.md`

---

# ISSUE-07

**제목:** `[ISSUE] AI 챗봇 지능형(퍼지) 검색 재설계`
**라벨:** `enhancement` `P3` `chatbot` **| 브랜치:** `feat/chatbot-fuzzy-search`

## 요약 (TL;DR)
챗봇은 intent(JSON)만 뽑아 `ilike` 부분일치로 조회한다. "최신곡"이 실제 최신순이 아니라 랜덤이고, 가수/곡 검색이 일반 검색과 다를 게 없다. 오탈자·발음변형·모호한 설명을 실제 곡/가수로 매칭하는 지능형 검색으로 재설계한다.

## 증상 (Symptoms)
- "최신곡" → 랜덤. "가수 곡" → 한 곡만, 검색과 동일. `PPPP`를 "피피피피"로 검색 실패. "아도"를 "에이도"/"여성 보컬 노래"로 물으면 매칭 실패.

## 근본 원인 분석 (Root Cause)
- `src/lib/gemini/intent.ts` — keyword(원문)만 추출 → `ilike '%kw%'`로 정확 표기만 매칭.
- `src/app/api/chat/route.ts` `handleRecommend` — `ai_traits` "최신곡"(발매일 아닌 LLM 라벨) 필터 후 20곡 중 랜덤. `handleSearchArtist` — `limit(1)` 한 곡, 하드코딩 `ARTIST_KO_MAP` 의존.
- 부수: intent용 `gemini-2.5-flash-lite` 간헐 HTTP 503.

## 해결 방안 (Proposed Fix)
- 표기 정규화·음차 매칭(로마자↔가나↔한글, `PPPP`↔피피피피), pg_trgm 확대 + 후보 다건.
- 가수 오인식 보정("에이도"→Ado, "여성 보컬"→속성 기반), 하드코딩 맵 대신 유사도 + AI 재해석.
- 가수 검색 리스트화(limit(1) 폐기, 인기순 + TOP100 배지 + 난이도).
- "최신곡"을 차트 진입일/created_at/rank_history NEW 기준 실데이터 정렬.
- 부수: intent 503 대응(재시도/폴백 또는 flash 승격).

## 우선순위 / 사이클
- 우선순위: **P3** · 사이클: **7**
- 상세: `docs/issues/ISSUE-07-chatbot-fuzzy-search.md`
