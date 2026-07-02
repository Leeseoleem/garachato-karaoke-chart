---
id: ISSUE-05
title: 금영(KY) 크롤러 부활
cycle: 5
priority: P2
status: 분석완료(미착수)
labels: [feature, crawler]
created: 2026-07-02
related: []
---

# ISSUE-05 · 금영(KY) 크롤러 부활

## 1. 요약 (TL;DR)

"금영은 크롤링 불가"라는 전제가 **현재는 틀렸다.** 구 도메인 `karaokeyou.com`은 소멸했고,
살아있는 `kygabang.com`은 **Node.js fetch로 정상 접근**된다. 탭을 제거할 게 아니라
크롤러를 되살리면 된다. 인프라(DB 스키마, 공통 파이프라인, 폴백 TODO)는 이미 준비돼 있다.

## 2. 배경 (Context)

- 현재 UI: `karachato/src/components/chart/KaraokeTabs/index.tsx` — KY 탭 클릭 시
  "🚧 금영 노래방은 아직 준비중이에요!" 토스트만 표시하고 라우팅 차단.
- README에는 "kygabang.com이 TLS 핑거프린트로 Node.js 차단, PowerShell만 응답" 서술 → **낡음**.
- 구 크롤러 `ky.ts`(commit 903e4d6)는 삭제됨(git 히스토리에만 존재).

## 3. 검증 결과 (2026-07-02, 실측)

- `karaokeyou.com` → **DNS 소멸**(도메인 죽음). "만료 도메인 리다이렉트" 증상의 정체로 추정.
- `https://kygabang.com/chart/new_jpop.php`:
  - **Node.js `fetch` 200 OK, 리다이렉트 없음**(258KB). Vercel 런타임에서 막히지 않음.
  - 서버사이드 렌더링 → HTML에 실제 데이터. 구 셀렉터 그대로 유효:
    순위 `td.ch_daily_01`, 곡번호 `td.ch_daily_03`, 곡명 `td.ch_daily_04 a.opbt`(.modal 제거), 가수 `td.ch_daily_05`.
  - 페이지당 20곡, `?page=1~5`로 TOP100 전체(page=2→21~40위, page=5→81~100위 확인).
  - 예시 데이터: 곡번호 44438 / 가수 `Official髭男dism`, `優里`, `tuki.`.

## 4. 해결 방안 (Proposed Fix)

1. `ky.ts` 크롤러 복원 → 도메인/URL을 `kygabang.com`으로 교체, `?page=1~5` 순회 추가.
   - `KY_CHART_URL`, `KYSong` 타입, 관련 상수 재도입.
2. `karachato/src/app/api/cron/route.ts`에 KY 크롤 파이프라인 연결(기존 `processCrawledSongs` 공통 함수 활용).
3. `KaraokeTabs`의 "준비중" 토스트 분기 제거 → 정상 라우팅.
4. `karachato/src/lib/youtube/process.ts`의 KY 폴백 TODO 구현(금영은 썸네일 미제공 → 유튜브 폴백).
5. README의 금영 관련 서술 정정.

## 5. 리스크 / 주의

- 금영은 썸네일을 제공하지 않음 → 유튜브 썸네일 폴백 의존도 증가(설계는 준비됨).
- 대상 사이트 구조 변경 가능성 → 셀렉터 회귀 테스트 권장.
- [ISSUE-02](ISSUE-02-orphan-song-records.md) 중복/정규화 이슈가 KY 유입으로 재현되지 않도록,
  01·02 선행 후 착수 권장.

## 6. 해결 로그 (Resolution Log)

> 상태: **미착수.**

### 조치 (Actions)
- _(작업 시 작성)_

### 결과 (Outcome)
- _(작업 시 작성)_

### 검증 (Verification)
- _(작업 시 작성: KY TOP100 100곡 수집, 탭 라우팅, 썸네일 폴백)_

### 관련 커밋/PR
- _(작업 시 작성)_
