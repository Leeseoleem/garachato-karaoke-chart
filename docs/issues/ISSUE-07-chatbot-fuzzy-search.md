---
id: ISSUE-07
title: AI 챗봇 지능형(퍼지) 검색 재설계
cycle: 7
priority: P3
status: 진행중
labels: [enhancement, chatbot, ai, search]
created: 2026-07-02
related: []
---

# ISSUE-07 · AI 챗봇 지능형(퍼지) 검색 재설계

## 1. 요약 (TL;DR)

챗봇은 현재 Gemini로 intent(JSON)만 뽑아 `ilike` 부분일치로 DB를 조회한다. 그래서
① "최신곡" 추천이 실제 최신순이 아니라 랜덤이고, ② 가수/곡 검색이 일반 검색과 다를 게 없다.
목표는 **오탈자·발음변형·모호한 설명을 실제 곡/가수로 매칭**하는 지능형 검색으로 재설계하는 것.

## 2. 증상 (Symptoms)

- "최신곡 찾아줘" → 아무 곡이나 나옴.
- "가수 곡 찾아줘" → 검색과 동일, 오히려 한 곡만 나옴.
- `PPPP`를 "피피피피"로 검색하면 못 찾음. "아도"를 "에이도", "여성 보컬 노래"로 물으면 매칭 실패.

## 3. 근본 원인 분석 (Root Cause)

- `karachato/src/lib/gemini/intent.ts` — intent와 `keyword`(원문)만 추출. keyword를 그대로
  `ilike '%kw%'`에 넘겨 **표기가 정확히 일치해야만** 걸림.
- `karachato/src/app/api/chat/route.ts`:
  - `handleRecommend` — `ai_traits`에 "최신곡" 라벨(발매일 아님, LLM 주관) 필터 후
    20곡 중 `Math.random()` 1곡. **최신순 정렬 없음.**
  - `handleSearchArtist` — `limit(1)`로 한 곡만. 하드코딩 `ARTIST_KO_MAP` 의존으로 커버리지 좁음.
- 부수: intent용 `gemini-2.5-flash-lite`가 간헐 HTTP 503(high demand) → intent 추출 불안정.

## 4. 해결 방안 (Proposed Fix)

### 방향: 퍼지/의미 기반 매칭
- **표기 정규화·음차 매칭**: `PPPP`↔"피피피피" 같은 발음 표기, 로마자↔가나↔한글 음차를
  정규화해 매칭. pg_trgm 유사도 확대 + 후보 다건 제시.
- **가수 오인식 보정**: "에이도"→`Ado`, "여성 보컬"→가수 속성 기반 후보 추림.
  하드코딩 맵 대신 DB의 `artist_norm`/`artist_ko` 유사도 + AI 재해석.
- **가수 검색 리스트화**: `limit(1)` 폐기, 여러 곡 + 인기순 + TOP100 배지 + 난이도 요약.
- **"최신곡"의 실데이터화**: `ai_traits` 라벨 대신 차트 진입일/`created_at`/rank_history `NEW` 기준 정렬.

### 부수
- ✅ **intent 모델 503 폴백 구현됨** — `gemini-2.5-flash-lite` → `flash` → `flash-latest` 순 폴백 + 실패 시 off_topic 대신 에러+재시도. (앱인토스 출시 준비 브랜치에서 반영, 배포됨)

## 4.5 확장: 대화 맥락(멀티턴) & 후보 변주 — `feat/chat-context`

> 실기기 테스트에서 발견. ISSUE-07 지능형 챗봇 방향의 일부로 먼저 착수.

### 배경 / 증상
- "히게단 노래 추천" → A곡 추천 → **"다른 거 추천"** → 생뚱맞은 **다른 가수**의 곡이 나옴.
  → ① 이전 맥락(히게단)을 잃음, ② 이미 보여준 곡을 제외하지 않음.

### 근본 원인
- `/api/chat`이 `{ message }` **하나만** 받아 `extractIntent(message)`로 **단일턴** 분류. 대화 이력이 전혀 전달되지 않음.

### 해결 (A/B/C)
- **A. 대화 맥락 전달** — ChatModal이 `messages`를 최근 N턴 `history`로 직렬화해 `{ message, history }` 전송. `extractIntent(message, history)`가 Gemini **멀티턴 contents**로 호출 + 시스템 프롬프트에 "이전 맥락 참조" 규칙 추가 → "다른 거", "좀 더 잔잔한", "그 가수 다른 노래" 이해.
- **B. 후보 변주(제외목록)** — 이미 보여준 `song_id`들을 `excludeIds`로 전송. 핸들러(`handleRecommend`/`handleSearchArtist`)가 `.not("id","in",…)`로 제외 후 다른 곡 반환. (recommend·artist는 다건 조회로 전환)
- **C. "아니에요" 플로우 개선** — song_candidate에서 "아니에요"를 누르면 열린 질문 대신 **바로 다음 후보**를 제시(맥락 + 제외목록 활용). 후보 소진 시 "이 조건엔 더 없어요"로 폴백. (특정 곡 검색 흐름은 재질문 유지)

### 단계 (하나씩)
1. **A** — history 배선(클라·route·types) + 멀티턴 `extractIntent` + 프롬프트 규칙
2. **B** — `excludeIds` 배선 + 핸들러 제외/다건화
3. **C** — "아니에요" → 다음 후보 버튼/플로우

## 5. 비고

- 가장 큰 설계 작업. 착수 전 UX 세부(후보 개수, 확인 플로우) 확정 필요.
- 데이터 품질([ISSUE-01](ISSUE-01-translation-batch-index-shift.md)~[ISSUE-03](ISSUE-03-translation-data-recovery.md))
  선행 시 매칭 정확도 상승.

## 6. 해결 로그 (Resolution Log)

> 상태: **미착수.**

### 조치 (Actions)
- _(작업 시 작성)_

### 결과 (Outcome)
- _(작업 시 작성)_

### 검증 (Verification)
- _(작업 시 작성: PPPP/에이도/여성보컬 등 케이스 매칭 확인)_

### 관련 커밋/PR
- _(작업 시 작성)_
