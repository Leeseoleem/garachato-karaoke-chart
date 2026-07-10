---
id: ISSUE-09
title: 배포 후 금영 크롤 점검 및 정기 모니터링
cycle: 9
priority: P1
status: 해결됨
labels: [ops, crawler, monitoring]
created: 2026-07-07
related: [ISSUE-05]
---

# ISSUE-09 · 배포 후 금영 크롤 점검 및 정기 모니터링

## 1. 요약 (TL;DR)

[ISSUE-05](ISSUE-05-ky-crawler-revival.md)로 금영(KY) 크롤러를 되살렸고 로컬 Node.js에서는
`kygabang.com` 접근이 정상 확인됐다. 다만 **실제 Vercel 서버리스 런타임에서도 크롤이 되는지는
배포해야만 확인**된다(과거 README가 "Vercel 차단"이라 주장했으나 로컬은 반증됨, 서버 환경은 미검증).
이 점검을 위한 **전용 브랜치를 만들어 배포 직후·다음날 확인하고, 결과와 수정을 로그로 남긴다.**

## 2. 배경 (Context)

- 로컬 검증: `kygabang.com/chart/new_jpop.php` → Node.js fetch 200 OK, TOP100 파싱 정상.
- 미검증: Vercel 서버리스 함수에서의 아웃바운드 접근(리전/TLS/봇 차단 등 로컬과 다를 수 있음).
- DB에는 2026-07-07 로컬 크론으로 이미 KY 100곡이 적재돼 있어, Vercel 크롤이 잠깐 실패해도
  기존 데이터는 노출된다(치명적 장애는 아님). 단 **매일 갱신**이 되려면 Vercel 크롤이 성공해야 한다.

## 3. 점검 대상 (Checklist)

- [ ] main 배포 직후 프로덕션 `/api/cron`을 1회 수동 호출(또는 Vercel Cron 수동 실행) →
      응답 `ky.processed`가 100 근처인지, 에러 없는지.
- [ ] 다음날 스케줄 크론이 자동으로 KY까지 크롤하는지(rank_history에 당일 KY 100행 갱신).
- [ ] `/api/cron-ai`가 매일 gemini 무료 한도만큼 잔여 pending곡(초기 26곡)을 줄여가는지.
- [ ] `/api/cron-youtube`가 신규곡 썸네일을 채우는지.
- [ ] 앱에서 금영 탭 라우팅·리스트·상세가 정상인지(원문/번역 표기).

## 4. 실패 시 대응 (Contingency)

- Vercel에서 kygabang 접근이 막히면: 런타임/리전 조정, `undici`/fetch 헤더 옵션, 마지막 수단으로
  경량 프록시 또는 별도 크롤 워커 검토. (이 판단·수정을 전용 브랜치에서 진행)

## 5. 운영 방식 (Ops)

- **전용 브랜치**: `chore/crawl-monitoring`(예시). 이 브랜치에서 점검 스크립트·수정·문서를 관리한다.
- 배포 다음날 확인 결과를 아래 로그에 남기고, 수정이 필요하면 이 브랜치에서 커밋한다.
- 반복 점검이므로, 확인 절차를 스크립트/체크리스트로 정리해 재사용한다.

## 6. 해결 로그 (Resolution Log)

> 상태: **해결됨 (2026-07-10).** Vercel 스케줄 크론의 금영 크롤 정상 확인.

### 조치 (Actions)
- DB `rank_history`를 provider별 chart_date로 조회해 Vercel 스케줄 크론의 실제 크롤 여부를 검증(수동 트리거는 CRON_SECRET 필요라 데이터로 확인).

### 결과 (Outcome)
- **금영(KY) 크롤 정상**: `rank_history`에 KY 100행이 2026-07-07(로컬 적재) 이후 07-08·09·10까지 매일 적재됨. 07-08 이후는 Vercel 스케줄 크론 산물 = 서버리스에서 금영 크롤 성공 확정. (README의 "Vercel 차단" 서술은 실증 반증됨.)
- TJ는 06-21~07-10 연속 유지(영향 없음).
- 잔여 번역(cron-ai): 무료 티어 분당 20요청(RPM) 한도로 한 번에 몰아 빼지 못하고 점진 소진 중. 간헐적 Gemini 오류는 별도 재시도 추가로 완화(브랜치 `feat/artist-name-consistency` 동봉, translate/describe retry).

### 남은 관찰(비차단)
- `/api/cron-youtube` 썸네일 채움, 앱 금영 탭 표시는 별도 확인 필요 시 점검(현재 데이터·UI상 문제 관측 없음).

### 관련 커밋/PR
- 코드 변경 없음(운영 확인). 데이터 검증은 Supabase 조회.
