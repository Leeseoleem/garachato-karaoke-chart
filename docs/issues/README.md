# 이슈 & 해결 로그

가라챠토(J-POP 노래방 차트) 서비스의 이슈 분석·해결 기록 저장소.
각 이슈는 한 문서에 **분석(원인·근거)** 과 **해결 로그(조치·결과·검증)** 를 함께 담는다.
문서 번호가 곧 작업 사이클 순서이며, 급한 것(데이터 무결성 → 사용자 대면 버그 → 기능 → 개선)부터 배치한다.

## 작성 규약

- 파일명: `ISSUE-NN-<slug>.md` — `NN`이 사이클 순서.
- 상단 프론트matter에 `cycle` / `priority` / `status` / `labels` / `related` 라벨.
- `status`: `분석완료(미착수)` → `진행중` → `해결됨` → `검증완료`.
- `priority`: `P0`(긴급/데이터 무결성) · `P1`(사용자 대면 버그) · `P2`(기능) · `P3`(개선).
- 수정 작업 시 각 문서 하단 **"해결 로그"** 섹션에 원인→조치→결과→검증 순으로 기록.

## 실행 순서 (3단계)

최종 목적지는 [앱인토스 출시](EPIC-apps-in-toss-migration.md)다. "마이그레이션(CSR 이주)과 상관있는 작업이냐"를
기준으로, **데이터/백엔드 영역(이주 후에도 그대로 쓰임)은 먼저**, **프론트/API 영역(이주 때 재작성)은 이주에 흡수**한다.

- **1차 — 데이터 무결성 (지금, 마이그레이션 무관):** ISSUE-01 → 02 → 03. 오염이 진행 중이고 cron/DB 영역이라
  이주와 독립적. ISSUE-04는 01~03으로 대부분 해소되므로 지금은 임시 가드만.
- **2차 — [앱인토스 마이그레이션](EPIC-apps-in-toss-migration.md):** web-framework 이주 + 데이터 계층 재작성.
  ISSUE-04(필터 정합성)와 ISSUE-07(챗봇 API 분리)을 여기서 흡수.
- **3차 — 기능 강화 (새 구조 위에서):** ISSUE-05 → 06 → 07.

## 이슈 현황

| # | 이슈 | 우선순위 | 단계 | 상태 | 요지 |
|---|------|:---:|:---:|:---:|------|
| [01](ISSUE-01-translation-batch-index-shift.md) | 번역 배치 인덱스 시프트 버그 | **P0** | 1차 | 분석완료 | 번역이 한 칸씩 밀려 저장 + 신규곡 pending 잔존의 **근본 원인** |
| [02](ISSUE-02-orphan-song-records.md) | 고아 song 레코드(트랙 0개) | **P0** | 1차 | 분석완료 | 중복곡이 정규화 불일치로 트랙 없이 삽입 → 01의 **트리거** |
| [03](ISSUE-03-translation-data-recovery.md) | 오염 번역 데이터 복구 | **P0** | 1차 | 분석완료 | 01·02 수정 후 밀린 번역본 재번역·복구 |
| [04](ISSUE-04-zombie-link-404.md) | TOP100 좀비 링크 404 | **P1** | 1차→2차 | 분석완료 | pending 곡이 리스트엔 뜨는데 상세는 done만 조회 → 404. 임시 가드 후 이주 때 정합 |
| [EPIC](EPIC-apps-in-toss-migration.md) | **앱인토스 출시 마이그레이션** | **EPIC** | 2차 | 진행중 | SSR 금지 → web-framework(Granite) 이주 + 데이터 계층 재작성 |
| [05](ISSUE-05-ky-crawler-revival.md) | 금영(KY) 크롤러 부활 | **P2** | 3차 | 분석완료 | "크롤 불가" 전제가 낡음 — 현재 실제로 수집 가능, 탭 유지 |
| [06](ISSUE-06-artist-name-consistency.md) | 가수 번역명 일관성/재사용 | **P2** | 3차 | 분석완료 | 같은 가수인데 곡마다 번역이 흔들림 → 기존 값 재사용 |
| [07](ISSUE-07-chatbot-fuzzy-search.md) | AI 챗봇 지능형(퍼지) 검색 재설계 | **P3** | 2차→3차 | 진행중 | 퍼지 매칭 + 대화 맥락(멀티턴)·후보 변주(feat/chat-context) |
| [08](ISSUE-08-discovery-curation.md) | 탐색/큐레이션(카테고리·신규곡·가수별) | **P3** | 출시후 | 분석완료 | 데이터 대부분 기존(ai_category·delta NEW·artist) → 발견성 강화 |

## 참고 (환경)

- Supabase 프로젝트: **karachato** (`twuqhafcssezckrbtkoo`, ap-northeast-2)
- 번역 파이프라인: Vercel Cron `/api/cron`(크롤 18:00 UTC) → `/api/cron-ai`(번역 18:10) → `/api/cron-youtube`(썸네일 18:20)
- LLM: Google Gemini — 번역 `gemini-2.5-flash`, 챗봇 intent `gemini-2.5-flash-lite`
