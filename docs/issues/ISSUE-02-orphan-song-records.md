---
id: ISSUE-02
title: 고아 song 레코드(트랙 0개) & 중복 삽입
cycle: 2
priority: P0
status: 분석완료(미착수)
labels: [bug, data-integrity, crawler]
created: 2026-07-02
related: [ISSUE-01, ISSUE-03]
---

# ISSUE-02 · 고아 song 레코드(트랙 0개) & 중복 삽입

## 1. 요약 (TL;DR)

같은 곡이 `title_norm` 정규화 불일치로 **중복 삽입**되면서, `karaoke_tracks`가 하나도 없는
`songs` 레코드(고아 곡)가 생긴다. 이 고아 곡은 번역 배치에서 `continue`로 건너뛰어져
영원히 `pending`으로 남고, 동시에 [ISSUE-01](ISSUE-01-translation-batch-index-shift.md)의
인덱스 시프트를 **유발하는 트리거**가 된다.

## 2. 증상 (Symptoms)

- `karaoke_tracks`가 0개인 `pending` 곡이 존재 (2026-07-02 기준 2곡):
  - `かわいいだけじゃ だめですか` / cutie street (created 2026-05-28)
  - `革命道中 on the way` / アイナ・ジ・エンド (created 2026-05-28)
- 두 곡 모두 `updated_at`이 생성 시점 그대로 → 배치가 매번 조회만 하고 건너뜀.

## 3. 근본 원인 분석 (Root Cause)

- 동일 곡이 **정규화 표기 차이**로 별도 `songs`로 삽입됨. 예:
  - `革命道中on the way` (2026-03-30, 트랙 있음, 정상 번역 완료)
  - `革命道中 on the way` (2026-05-28, 공백 하나 차이, 트랙 0개, 고아)
- `title_norm` + `artist_norm` 기반 중복 감지가 이 표기 차이를 흡수하지 못함.
- 트랙 없는 songs가 생기는 삽입 경로(크롤 upsert 순서/실패 처리)를 점검해야 함
  → `karachato/src/app/api/cron/route.ts`, `karachato/src/lib/crawlers/*`, `karachato/src/utils/string.ts`(`normalize`).

## 4. 영향 범위 (Impact)

- 고아 곡 자신: 영구 pending, 화면에 데이터 없이 노출될 위험.
- 배치 전체: 고아 곡이 chunk에 섞여 [ISSUE-01](ISSUE-01-translation-batch-index-shift.md)의
  번역 오연결·pending 잔존을 촉발.

## 5. 해결 방안 (Proposed Fix)

1. **정규화 로직 강화** — `normalize`에서 연속 공백/전각·반각/영문 대소문자 등을 통일해
   `title_norm`/`artist_norm` 중복 감지 신뢰도 향상.
2. **기존 고아 레코드 정리** — 트랙 0개 songs를 식별해, 정상 중복본과 병합하거나 삭제.
   (rank_history·karaoke_tracks 참조 무결성 확인 후)
3. **삽입 방어** — 크롤 시 트랙과 song을 원자적으로 함께 생성하거나, 트랙 없는 song 생성을 막음.
4. (완화) 번역 배치가 트랙 0개 곡을 만나도 인덱스가 어긋나지 않도록
   [ISSUE-01](ISSUE-01-translation-batch-index-shift.md)의 매핑 수정을 함께 반영.

## 6. 해결 로그 (Resolution Log)

> 상태: **미착수.**

### 조치 (Actions)
- _(작업 시 작성)_

### 결과 (Outcome)
- _(작업 시 작성)_

### 검증 (Verification)
- _(작업 시 작성: 트랙 0개 songs 수 = 0 확인, 중복 title_norm 그룹 재확인)_

### 관련 커밋/PR
- _(작업 시 작성)_
