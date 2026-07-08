---
id: ISSUE-10
title: 탐색/큐레이션 탭 (가수별·최근 추가 모음집)
cycle: 10
priority: P2
status: 대기(아이디어)
labels: [enhancement, ux, discovery]
created: 2026-07-08
related: [ISSUE-08]
---

# ISSUE-10 · 탐색/큐레이션 탭

## 1. 요약 (TL;DR)

현재는 TJ/KY TOP100 차트만 보여준다. 탭(또는 화면)을 추가해 다른 방식의 탐색을 제공한다.
- **가수별 노래 모음집** — 한 가수의 곡을 모아보기
- **최근 추가된 노래 모음집** — 신규 진입곡 모아보기
- 그 외 큐레이션(카테고리·무드·난이도 등)

## 2. 참고

- [ISSUE-08](ISSUE-08-discovery-curation.md)의 탐색/큐레이션 아이디어와 겹치므로 **통합 검토**한다(중복 이슈 정리 필요).
- 데이터 소스: `songs`(ai_category, ai_traits, ai_vibes, created_at, artist_norm), `rank_history`(delta_status='NEW').

## 3. 작업 (초안)

1. 탐색 탭/화면 라우팅 추가 — **웹 karachato + 앱 karachato-app 둘 다** ([[dev-app-parallel-work]]).
2. **가수별 모음**: `artist_norm` 그룹핑 → 해당 가수 곡 목록(순위·번역·썸네일).
3. **최근 추가**: `songs.created_at` 또는 `rank_history.delta_status='NEW'` 기준 정렬.
4. **큐레이션 카테고리**: `ai_category`/`ai_traits`/`ai_vibes`로 묶은 모음(예: "애니 OST", "역주행", "보컬로이드").
5. 두 provider(TJ/KY) 통합 뷰인지 provider별인지 결정.

## 4. 해결 로그 (Resolution Log)

> 상태: **대기(아이디어).**
