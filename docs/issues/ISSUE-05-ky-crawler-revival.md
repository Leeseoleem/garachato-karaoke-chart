---
id: ISSUE-05
title: 금영(KY) 크롤러 부활
cycle: 5
priority: P2
status: 해결(코드 완료, 배포·잔여번역 대기)
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

> 상태: **코드 완료(2026-07-07). dev→main 배포와 잔여 번역만 남음.**

### 조치 (Actions)
- `src/lib/crawlers/ky.ts` 신설: kygabang.com 차트를 cheerio로 파싱, `?page=1~5`로 TOP100 수집. 한 페이지라도 실패/0곡이면 부분 오염 방지를 위해 전체 실패.
- `src/lib/crawlers/process.ts` 신설: cron/route.ts의 TJ 인라인 적재 로직을 provider 파라미터화한 `processCrawledSongs` 공통 함수로 추출(TJ/KY 공용).
- `src/app/api/cron/route.ts`: TJ 다음 KY 순차 처리. KY 실패가 TJ 결과를 무효화하지 않도록 분리.
- 같은 곡 판정 강화: 정확 매칭 → 강화 정규화(괄호/feat 이후 제거) → 동일 karaoke_no 재사용. 원문 표기는 provider별로 유지하고 번역만 TJ에서 공유(재번역 0).
- delta용 직전 순위 조회를 provider별로 스코프(KY 첫 크롤 때 UNKNOWN 처리).
- `KaraokeTabs`: "준비중" 토스트 제거 → 정상 라우팅.
- `src/lib/youtube/process.ts`: 유튜브 썸네일 폴백을 TJ 전용에서 TJ/KY로 확장.
- `src/lib/chart/queries.ts`: 최신 chart_date 조회를 provider별로 스코프(어느 한쪽 크롤 실패 시 빈 차트 방지).
- `ChartInfoPopover`: 출처 안내에 금영(KY) 추가.
- README 금영 서술 정정("크롤 불가"는 구 도메인 소멸이 원인이었음).
- (DB 운영 도구) `normalize_ko()` 함수 생성: 번역 수동 수정 시 `title_ko_norm`/`artist_ko_norm` 자동 계산.

### 결과 (Outcome)
- KY TOP100 100곡 적재. 53곡은 기존 TJ와 공유(원문 각자, 번역 공유), 47곡은 금영 전용 신규.
- 4곡 수동 병합: 丸ノ内サディスティック(가나 の↔ノ), さよーならまたいつか(로마자 병기차), ルカルカ★ナイトフィーバー·ワールドイズマイン(보컬로이드 작곡가/보컬 표기차).
- 유튜브 썸네일 47/47 완료. AI 번역 21/47(나머지 26곡은 gemini 무료 일당 한도로 이월, 매일 자동 처리).

### 검증 (Verification)
- 로컬 크론 실행: TJ/KY 각 100곡 처리, 실패 0 (`ok:true`).
- 원문 보존 + 번역 공유 확인(天ノ弱/pretender/オレンジ: KY 원문 유지, `title_ko_jp`는 TJ 번역 공유).
- 금영 전용 47곡 전수 유사도 검증: 강후보 0, 놓친 동일곡 없음(전부 진짜 신규 확정).
- 강화 매칭 6곡 검수: 오매칭 0. 고아 song 0.

### 관련 커밋/PR
- 브랜치 `feat/ky-crawler-revival` (공통함수 추출 / ky.ts / cron 연결·매칭·원문보존 / 탭 / 유튜브 폴백 / 차트 날짜 / 금영 안내 / README / 문서).

### 남은 것 / 후속
- **배포(dev→main) 후 Vercel 런타임에서 kygabang 접근 확인** → [ISSUE-08](ISSUE-08-post-deploy-crawl-check.md) 크롤 점검.
- 번역 26곡: gemini 무료 일당 한도 회복 시 매일 cron-ai가 자동 처리(또는 유료 전환 시 즉시).
