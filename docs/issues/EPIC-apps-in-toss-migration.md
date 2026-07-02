---
id: EPIC-apps-in-toss-migration
title: 앱인토스(Apps in Toss) 출시 마이그레이션
cycle: 2차 (데이터 무결성 이후 · 기능 강화 이전)
priority: EPIC
status: 계획확정(착수대기)
labels: [epic, migration, apps-in-toss, architecture]
created: 2026-07-02
related: [ISSUE-04, ISSUE-07]
---

# EPIC · 앱인토스(Apps in Toss) 출시 마이그레이션

## 1. 요약 (TL;DR)

이 유지보수의 최종 목적지는 **앱인토스 출시**다. 앱인토스는 **SSR을 금지(CSR/SSG만 허용)**하고,
웹뷰 앱을 **`@apps-in-toss/web-framework`(Granite, React Native 기반) 위로 이주**시켜야 한다.
현재 앱은 Next.js 16 App Router + 서버 컴포넌트/SSR 구조라 그대로는 올릴 수 없다.
단, 이는 "렌더링 모드 토글"이 아니라 **프레임워크 이주 + 데이터 계층 재작성**이다.

## 2. 현재 구조 (출발점)

- Next.js 16 (App Router), React 19, 서버 컴포넌트/SSR.
- 데이터 로딩이 서버에서 발생: `getChartByProvider`, `getSongById`가 `@supabase/ssr`로 서버 fetch.
- 백엔드 로직: `/api/chat`, `/api/search` (Next API routes) + `GEMINI_API_KEY`/`SUPABASE_SECRET_KEY`.
- 데이터 파이프라인: Vercel Cron `/api/cron`·`/api/cron-ai`·`/api/cron-youtube` (크롤/번역/썸네일).

## 3. 제약 & 사실 (검증됨, 2026-07-02)

- **SSR 금지** — 앱인토스는 CSR 또는 SSG만 허용.
- **프레임워크 이주 필요** — `granite`는 토스의 RN 프레임워크. `@apps-in-toss/web-framework`가 그 위에서
  동작하며 **자체 파일 기반 라우팅(`intoss://` scheme) · `granite.config.ts` · 번들 구조를 강제**.
  빌드는 `granite build` → `.ait` 산출(`granite.config.ts`의 outdir, 기본 `dist`).
- **`next/*` 미사용** — `next/image`·`next/link`·`next/font`·route handler는 그 환경에서 신규 대체 필요.
- **외부 백엔드 HTTPS 호출 가능** — 웹뷰에서 Vercel/Supabase/Firebase 등 외부 API 호출 지원.
  단 **`granite.config.ts`에 대상 도메인 permissions 등록 필수**(미등록 시 "Load failed"/CloudFront 403 사례 보고).
- **Supabase 직결 가능** — anon key + RLS로 클라이언트가 직접 조회 가능.

> **⚠️ 업데이트 (2026-07-02, 재조사):** 위 "검증됨" 항목 중 2가지를 정정한다.
> 1. **SDK 트랙 정정** — `@apps-in-toss/web-framework`는 **WebView 트랙(React DOM + Vite 빌드)**이다. `<div>`/HTML/CSS와 기존 React 컴포넌트를 **그대로 재사용**한다. 위 본문의 "Granite(RN 기반)·`granite build`→`.ait`" 서술은 **RN 트랙과 혼동**한 것으로, 우리가 쓸 트랙이 아니다. (조사 에이전트 간 번들러 진술이 Vite/Metro로 갈려, 정확한 번들러는 S0에서 실측 확인.)
> 2. **도메인 permissions 정정** — 리서치(토스 공식 스레드·직원 답변) 결과 `granite.config.ts`의 `permissions[]`는 **기기 권한(카메라/클립보드 등)용**이며 **외부 도메인 화이트리스트 키는 없다**. 외부 HTTPS는 **정상 TLS + CORS**면 호출된다. "Load failed"/403은 도메인 미등록이 아니라 **잘못된 URL·SSL·CORS 누락**이 원인. → 설치된 SDK 버전 타입으로 S0에서 재확인.
> 3. **React 버전 주의** — WebView 트랙 문서는 **React 18** 기준. 현재 앱은 19.2.3 → S0에서 부팅 검증, 실패 시 18로 핀.

## 4. 마이그레이션 범위 (What changes)

| 계층 | 지금 | 이주 후 |
|------|------|---------|
| 프레임워크/앱 셸 | Next.js App Router | `@apps-in-toss/web-framework`(Granite) 신규 진입점·라우팅·config |
| 렌더링 | SSR/서버 컴포넌트 | CSR |
| UI 컴포넌트 | React | **재사용**(순수 컴포넌트), `next/*` 의존부만 교체 |
| 데이터 로딩 | 서버 fetch(`@supabase/ssr`) | 클라이언트 fetch(Supabase anon key + RLS) |
| 백엔드 로직(챗봇/검색/Gemini·secret) | Next API routes | **클라에서 분리** — Vercel API route 유지 **or** Supabase Edge Function (택1). 어느 쪽이든 `granite.config.ts` 도메인 등록 |
| cron 파이프라인 | Vercel Cron | **변경 없음** — 사용자 앱과 분리해 기존 서버 유지 |
| 로그인/결제 | 없음 | (선택) 앱인토스 로그인·IAP SDK |

## 5. 사이클 상 위치 & 다른 이슈와의 관계

- **1차(데이터 무결성, 마이그레이션 무관):** ISSUE-01·02·03 먼저. cron/DB 영역이라 이주 후에도 그대로 쓰임.
- **본 에픽(2차):** 프레임워크 이주. 이때 아래를 흡수:
  - **ISSUE-04(좀비 링크 404)**: 상세페이지가 CSR로 재작성되므로 필터 정합성은 여기서 제대로. (1차엔 임시 가드만)
  - **ISSUE-07(챗봇)**: `/api/chat`을 분리 백엔드로 옮기는 게 전제라, 챗봇 재설계는 이주와 함께.
- **3차(기능 강화):** ISSUE-05(금영)·06(가수명)·07(챗봇 지능형 검색)을 새 구조 위에서.
  - 참고: 금영 크롤러 자체는 백엔드(cron)라 시점 무관하나, 새 탭 UI 노출은 이주 후가 깔끔.

## 6. 해결 로그 (Resolution Log)

> 상태: **미착수.**

### 조치 (Actions)
- _(작업 시 작성: web-framework 셋업, granite.config.ts, 데이터 계층 이전 등)_

### 결과 (Outcome)
- _(작업 시 작성)_

### 검증 (Verification)
- _(작업 시 작성: 샌드박스 빌드/.ait, 외부 도메인 fetch, Supabase 직결, 주요 화면 동작)_

### 관련 커밋/PR
- _(작업 시 작성)_

---

## 7. 실행 계획 (확정 · 2026-07-02)

> 10개 에이전트(코드 6분면 조사 + 프레임워크 리서치 2 + 종합 + 반론검증)로 도출·검증한 확정안.
> 착수는 대기 중(사용자 요청). Toss 개발자 콘솔 앱 등록(→ `appName` 확보)이 선행되면 S0부터 진행.

### 7.1 확정된 결정
- **트랙:** WebView(`@apps-in-toss/web-framework`, React DOM + Vite). RN `granite build` 아님.
- **타깃:** **웹뷰 우선 + 동일 Vite SPA를 공개 웹에도 배포**(별도 Next 앱 이중 유지 X). 웹뷰 번들이 곧 웹사이트가 됨. 포기하는 것은 SSR급 SEO/공유 OG 미리보기 → 필요 시 **prerender(SSG) 후속 과제**.
- **라우팅:** **URL 기반**(react-router 등). **딥링크(`intoss://{app}/song/{id}`) + 웹 공유를 동시 충족.** 기존 `?provider`/`?q`도 URL로 유지 가능. → 원안의 "상태 기반(딥링크 포기)"을 **URL 기반으로 뒤집음**(딥링크 요구 반영).
- **데이터:** 클라 Supabase(publishable 키 + RLS). **화면 이식 전 RLS 정책 선행**(현재 정책 0개 → anon SELECT가 조용히 빈 배열 반환하는 함정).
- **백엔드:** `/api/chat`(Gemini 시크릿)·`/api/search`는 **Vercel 유지**(절대 URL + CORS). **cron 3종 불변.**
- **불변식:** `lib/supabase/server.ts`(SECRET 키)는 **웹뷰 번들 유입 절대 금지**.

### 7.2 단계 (각 1 PR · `feat/apps-in-toss-migration` → `dev`)

위험한 미지수를 앞에서 먼저 깨는 순서. (★ = 반론검증에서 보강)

| 단계 | 목표 | 핵심 산출물 |
|---|---|---|
| **S0** | 프레임워크 부트 + **SDK 실측 조사**(네비 API·env 주입·네트워크 필드·React19 부팅)★ + dev 스크립트 공존 | `granite.config.ts` + Vite 엔트리가 샌드박스에서 DOM 렌더 |
| **S0.5**★ | **네트워크/CORS 스파이크** — 샌드박스에서 절대 HTTPS GET/POST 성공 증명 | 외부 fetch 왕복 확인 |
| **S1** | Tailwind v4 + Pretendard `@font-face` 파이프라인 복원 | 웹뷰에서 디자인 시스템 정상 렌더 |
| **S2** | **RLS 정책 SQL 마이그레이션** + 클라 read 실제 행 반환 증명 | `supabase/migrations/` + publishable 키로 데이터 흐름 |
| **S3** | CSR 셸: URL 라우터·에러바운더리·뒤로가기/외부링크 심 + **safe-area/상단 chrome**★ | 셸 + placeholder 화면 |
| **S4** | 홈/차트(provider를 URL 파라미터로; **`ChartClientWrapper` 프롭 계약 변경**★) | 클라 페치로 실제 TOP100 |
| **S5** | 곡 상세(동적 id·`notFound`→화면상태·`next/image`→`img`·**챗 시트 dismiss**★) | 상세 화면 완성 |
| **S6** | 검색 + 백엔드 절대 URL/CORS 재지정 + **시크릿 로테이션·레이트리밋**★ | 검색·챗봇 왕복 |
| **S7** | 정리 · **시크릿 누출 정적 감사** · 디바이스 QA | 무결 번들 + QA 통과 |

> 타깃이 "웹 병행"이므로 S3/S7에서 SEO 표면(sitemap/robots/metadata)을 **일괄 삭제하지 않고**, 클라 사이드 메타(react-helmet 등) + URL 구조 유지로 전환한다.

### 7.3 열린 항목 (엔지니어링 기본값 — 필요 시 조정)
- React 19: S0 검증 → 실패 시 18 핀. · 번들러(Vite/Metro): S0 실측. · 도메인 permissions 키 유무: S0에서 설치 SDK 타입 확인.
- 데이터 페칭: 우선 `useEffect`, 통증 시 react-query 도입. · 설정 영속화(displayMode 등): 당분간 in-memory.
- `/api/search`: 우선 백엔드 유지, RLS 안전 확인 후 클라 직접 rpc로 접기(후속 최적화).

### 7.4 디자인 심사 준수 (2026-07-03 심층 재조사)
> 웹뷰 미니앱은 심사가 있음. "TDS 필수"는 과장(자체 UI·커스텀 색상 허용). 그러나 **상단 내비게이션 바**와 **다크 테마**에 대해 아래를 확정. 다크패턴 5종 금지(진입 즉시 전면광고/시트, 이탈 방해, 거절 불가 CTA 등)는 우리 앱 해당 없음.

**A. 상단 내비게이션 바 — 계획에 직접 영향(확실도 높음)**
- 상단 내비바는 **토스 호스트가 자동 렌더**. 앱이 자체 상단바를 그리면 안 됨. `headerShown:false`는 자동 반려.
- **자체 뒤로가기 버튼 금지** — 호스트 뒤로가기와 우리 `BackButton`이 동시에 보이면 반려(비게임 체크리스트 명시). → **자체 `BackButton` 제거, 호스트 `withBackButton` 사용.** `BackButton`(보라 셰브론)이 있는 곳: ① 곡 상세 `BackHeader`(+SongDetailSkeleton) ② 검색 `SearchHeader`(mode="search"). 홈엔 없음. 뒤로가기 *동작*은 유지(호스트 back → 라우터 스택 pop, S3에서 처리). 상단바 타이틀은 콘솔 앱 이름 고정이라 BackHeader의 "곡 상세 정보" 타이틀은 호스트바 불가 → 본문 표기. **웹 병행 배포 시 웹에선 자체 back이 사라지므로 플랫폼 분기 여부는 S3에서 결정.**
- 상단바 **타이틀 = 콘솔 등록 한글 앱 이름**(런타임 변경 불가). BackHeader `title` 프롭으로 화면별 타이틀 못 넣음 → 필요 시 본문 내 표기.
- 내비바는 `granite.config.ts` 빌드타임 설정(`withBackButton`·`theme`·`transparentBackground` 등). **기본 theme=light(흰색)**.
- **다크 네비바:** `navigationBar.theme:'dark'` (SDK **≥ 2.8.0**). 미적용 시 흰 네비바가 `#121216`과 충돌(흰 이음새/콘텐츠 블리드 — 실제 사례 보고).

**B. 다크 "모드" vs 다크 "컨셉" — 판정: 조건부(리스크 낮음)**
- **핵심 구분:** 토스 규정의 "다크 모드 미지원 / 라이트 모드 기준"은 **OS 자동 라이트↔다크 전환(=모드 대응)**을 겨냥함(FAQ 질문이 *"시스템 모드의 다크 모드를 지원하나요?"*로 한정). 우리 앱은 시스템 설정에 반응하는 게 아니라 **항상 고정 다크인 브랜드 컨셉** → 규정이 막는 "모드 대응"과 결이 다름.
- **남는 리스크 = 문구 하나뿐:** 비게임 체크리스트가 하필 *"미니앱 테마는 라이트 모드로 **구현**돼 있어요"*라고 **색을 콕 집음**. 엄격 리뷰어가 이를 문자 그대로 "밝은 화면이어야"로 읽으면 걸 수 있는 **재량 리스크**.
- **정황은 우리 편:** 실제 **고정 다크 컨셉 비게임 앱이 출시**됨(techchat 3198 — 불만은 흰 네비바뿐, 다크 콘텐츠 지적 없음). TDS 강제 아님 + 토스가 다크 네비바 공식 제공(SDK 2.8.0).
- **결론: 다크 컨셉 유지로 진행.** 라이트 테마 선제 구축 비추. 확정 원하면 토스에 *"시스템 다크 대응이 아니라 고정 다크 컨셉인데 가능한가요?"* 프레이밍으로 문의.

**C. 탭바 / safe-area**
- 탭바 규칙은 **앱레벨 하단 탭바**에만 적용(하단 토스 탭과 혼동 방지). 우리 `KaraokeTabs`(본문 내 TJ/KY 토글)·`FloatingBar`(액션 필)는 **대상 아님 → 그대로 OK**. 단 FloatingBar는 섹션 내비처럼 안 보이게 액션 위주 유지.
- safe-area는 **웹에서** 처리: `viewport-fit=cover` + `env(safe-area-inset-*)`. `pullToRefreshEnabled:false`, 핀치줌 비활성(핀치줌 = 반려 트리거).

**우리 컴포넌트 조치 요약:**
- 🔴 blocker: ① BackHeader/BackButton 자체 뒤로가기 제거(호스트 네비바 사용) ② `granite.config.ts` 생성(`navigationBar.theme:'dark'` + SDK≥2.8.0 확인/업)
- 🟡 should-fix: FloatingBar 액션 전용 + safe-area inset · 핀치줌/풀투리프레시 off · 화면별 타이틀 런타임 의존 제거
- 🟢 그대로: KaraokeTabs, ChatModal/SettingModal(다크 스타일 일관성만)
