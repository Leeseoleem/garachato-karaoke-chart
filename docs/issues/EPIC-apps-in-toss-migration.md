---
id: EPIC-apps-in-toss-migration
title: 앱인토스(Apps in Toss) 출시 마이그레이션
cycle: 2차 (데이터 무결성 이후 · 기능 강화 이전)
priority: EPIC
status: 분석완료(미착수)
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
