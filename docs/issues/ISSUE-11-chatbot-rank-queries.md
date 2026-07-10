---
id: ISSUE-11
title: 챗봇 순위·개념 질의 확장
cycle: 11
priority: P3
status: 대기(아이디어)
labels: [enhancement, chatbot]
created: 2026-07-08
related: [ISSUE-07]
---

# ISSUE-11 · 챗봇 순위·개념 질의 확장

## 1. 요약 (TL;DR)

현재 챗봇은 노래(곡/가수) 검색만 한다. **순위 같은 새 개념 질의**를 도입해 대화로 차트를 탐색하게 한다.
- "지금 1위 곡은?", "이번 주 신규 진입곡", "OO의 최고 순위는?"
- 특정 곡의 현재 순위·순위 변동(delta) 조회

## 2. 참고

- [ISSUE-07](ISSUE-07-chatbot-fuzzy-search.md)의 지능형(퍼지) 검색 위에 얹는다.
- 데이터 소스: `rank_history`(rank, delta_status, delta_value, chart_date), provider별.

## 3. 작업 (초안)

1. intent 추출에 **순위/변동 질의 타입** 추가(예: `rank_lookup`, `new_entries`, `top_n`).
2. `rank_history` 기반 조회 핸들러:
   - 현재 순위(최신 chart_date), 특정 곡의 순위·변동
   - 최고 순위(역대 min rank), NEW 진입곡
3. 응답 포맷: 순위·변동(▲▼) 표시, provider(TJ/KY) 구분.
4. "최신곡" 등 기존 모호 질의도 실데이터(진입일·NEW) 기준으로 정합화([ISSUE-07] 연계).

## 4. 해결 로그 (Resolution Log)

> 상태: **대기(아이디어).**
