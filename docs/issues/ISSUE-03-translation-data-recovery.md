---
id: ISSUE-03
title: 오염 번역 데이터 복구
cycle: 3
priority: P0
status: 분석완료(미착수)
labels: [data-integrity, recovery, ai-pipeline]
created: 2026-07-02
related: [ISSUE-01, ISSUE-02]
---

# ISSUE-03 · 오염 번역 데이터 복구

## 1. 요약 (TL;DR)

[ISSUE-01](ISSUE-01-translation-batch-index-shift.md)로 밀려 저장된 번역본을 바로잡는 작업.
SQL로 시프트를 "되돌리는" 방식은 위험하므로, **버그 수정 후 오염 곡을 재번역**하는 방식으로 복구한다.

## 2. 배경 (Context)

- 번역본은 두 테이블에 분산 저장되며, 화면마다 읽는 컬럼이 다르다:

  | 테이블 | 번역 컬럼 |
  |---|---|
  | `songs` | `title_ko`, `title_ko_norm`, `artist_ko`, `artist_ko_norm`, `description`, `ai_*` |
  | `karaoke_tracks` | `title_ko_jp`, `title_ko_full`, `artist_ko` |

  | 화면 | 읽는 컬럼 |
  |---|---|
  | 곡 상세 | `songs.title_ko / artist_ko / description / ai_*` |
  | TOP100 리스트 | `karaoke_tracks.title_ko_jp / title_ko_full / artist_ko` (+ songs) |
  | 검색 표시 | `karaoke_tracks.title_ko_jp / artist_ko` |
  | 검색 매칭(`search_songs` RPC) | `songs.title_ko_norm / artist_ko_norm`(pg_trgm) + `kt.title_ko_jp / artist_ko`(ILIKE) |

- 자동 전파 트리거는 없다. 수동 UPDATE 시 두 테이블 + `_norm`까지 모두 맞춰야 한다.

## 3. 복구 방안 (Proposed Approach)

### 권장: 재번역 (안전·일괄)
1. [ISSUE-01](ISSUE-01-translation-batch-index-shift.md) 인덱스 버그 수정 완료 전제.
2. [ISSUE-02](ISSUE-02-orphan-song-records.md) 고아 레코드 정리 완료 전제.
3. 오염 의심 곡을 `ai_status='pending'`으로 리셋.
   - 범위 판정: `title_norm`↔`title_ko`가 명백히 불일치하는 곡 + 고아 곡 등장(약 2026-05-28) 이후
     `updated_at` 곡. 안전하게는 done 전 곡 재번역도 검토(143곡, 비용 감안).
4. `/api/cron-ai` 재실행 → 모든 컬럼(`_norm` 포함)이 올바르게 재생성됨.

### 비권장: SQL 시프트 되돌리기
시프트 폭이 배치·고아곡 위치에 따라 달라 경계가 불명확 → 오히려 데이터가 더 꼬일 위험.

## 4. 실행 주체

Claude가 Supabase(`twuqhafcssezckrbtkoo`)에 직접 SQL/리셋 실행 가능(승인 후).
사용자가 SQL Editor에서 직접 할 필요 없음.

## 5. 해결 로그 (Resolution Log)

> 상태: **미착수.**

### 조치 (Actions)
- _(작업 시 작성: 리셋 대상 쿼리, 재번역 실행 로그)_

### 결과 (Outcome)
- _(작업 시 작성: 재번역 곡 수, 전/후 비교)_

### 검증 (Verification)
- _(작업 시 작성: 샘플 곡 title_norm↔title_ko 정합, pending=0, 검색/차트/상세 표시 확인)_

### 관련 커밋/PR
- _(작업 시 작성)_
