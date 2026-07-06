---
id: ISSUE-06
title: 가수 번역명 일관성 / 재사용
cycle: 6
priority: P2
status: 진행중
labels: [enhancement, ai-pipeline, data-quality]
created: 2026-07-02
related: [ISSUE-01, ISSUE-03]
---

# ISSUE-06 · 가수 번역명 일관성 / 재사용

## 1. 요약 (TL;DR)

번역 배치는 매 곡마다 가수명을 **독립적으로 새로 번역**하고, DB에 이미 저장된 `artist_ko`를
참조하지 않는다. 그 결과 같은 가수인데 곡마다 표기가 흔들릴 수 있다. 기존 번역명을 재사용해
일관성을 확보한다.

## 2. 증상 (Symptoms)

- 같은 원문 가수(`artist_norm`)에 대해 곡별로 다른 `artist_ko`가 저장될 수 있음. 예:
  - `Official髭男dism` → `Official髭男dism` / `Official히게단디즘` / `오피셜히게단디즘` (혼재 관측).
  - `優里` → `유우리` / `유리` 혼재.

## 3. 근본 원인 분석 (Root Cause)

- `karachato/src/lib/gemini/translate.ts` `translateSongBatch` — 프롬프트에 기존 번역 컨텍스트 없음.
- `karachato/src/lib/ai/process.ts` — 번역 전 기존 `artist_ko` 조회/주입 로직 없음.
- 프롬프트 규칙은 "일본어 가수명만 한글 발음 표기, 영어는 원문 유지"뿐이라, 표기 흔들림을 막지 못함.

## 4. 해결 방안 (Proposed Fix) — 택1

1. **코드에서 조회 후 그대로 대입(권장)** — 번역 실행 전 `songs`/`karaoke_tracks`에서
   해당 `artist_norm`의 기존 `artist_ko`가 있으면 재번역하지 않고 그 값을 그대로 사용.
   - 장점: 비결정성 원천 차단, LLM 호출 절감.
2. **프롬프트 주입** — "기존 번역: X — 특별한 이유 없으면 동일 사용"을 컨텍스트로 전달.
   - 장점: 유연. 단점: 여전히 LLM이 흔들 여지.

→ 가수명은 1번(결정적)이 적합. 곡 제목/설명은 곡마다 달라 기존 방식 유지.

## 5. 의존성

- [ISSUE-01](ISSUE-01-translation-batch-index-shift.md)/[ISSUE-03](ISSUE-03-translation-data-recovery.md)
  로 오염이 정리된 뒤라야 "기존 `artist_ko`"가 신뢰 가능한 재사용 소스가 된다.
  01·03 이후 착수 권장. [ISSUE-05](ISSUE-05-ky-crawler-revival.md) 금영 유입 전에 반영하면
  신규 KY 곡부터 일관되게 저장되는 이점.

## 6. 해결 로그 (Resolution Log)

> 상태: **진행중 (데이터 잔여 정리 완료, 파이프라인 재사용 미구현).**

### 조치 (Actions)
- (2026-07-06) 잔여 불일치 데이터 패치: `deco27` "Feat. 하츠네 미쿠" 공백 통일, `kanaria` "Feat.GUMI"를 "Feat.구미"로 통일 (songs·karaoke_tracks 총 3행).
- 근본(파이프라인이 기존 `artist_ko`를 재사용) 은 미구현. `process.ts`/`processArtistKo`가 여전히 곡마다 독립 번역.

### 결과 (Outcome)
- 현재 데이터 기준 같은 `artist_norm`의 `artist_ko` 유일성 확보. 남은 변형(`米津玄師` "(+스다 마사키)", `みきとp` 피처링별)은 실제로 다른 협업이라 정상.
- 재발 방지가 없어 새 곡 유입 시 다시 흔들릴 수 있음. 해결 방안 1번(조회 후 대입) 후속 필요.

### 검증 (Verification)
- (2026-07-06) `deco27`/`kanaria` 각 songs_variants=1, kt_variants=1 확인.

### 관련 커밋/PR
- 데이터 패치는 DB 직접 반영(마이그레이션 파일 없음). feat/chat-chart-options.
