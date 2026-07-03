# 앱인토스 마이그레이션 — 핸드오프 / 이어가기 로그

> 새 채팅/세션에서 이어갈 때 **이 문서부터 읽으면 됨.** (최종 업데이트: 2026-07-03)
> 브랜치: `feat/apps-in-toss-migration` · 전체 계획: [docs/issues/EPIC-apps-in-toss-migration.md](issues/EPIC-apps-in-toss-migration.md) §7

## 0. 새 채팅에서 이어가는 법
1. 이 문서 + `docs/issues/EPIC-apps-in-toss-migration.md` §7 읽기
2. `git log --oneline -8`로 지금까지 커밋 확인
3. `karachato-app/`에서 `npx vite` → `localhost:5173`으로 현재 상태 눈으로 확인
4. 아래 "다음 할 일"부터 진행

## 1. 한 줄 요약
J-POP 노래방 차트 앱(가라챠토)을 **앱인토스(WebView 트랙)**로 이주 중. 새 **Vite+React18 앱(`karachato-app/`)**을 만들어 기존 Next 앱(`karachato/`)의 컴포넌트를 이식하는 방식. **토대(프레임워크·스타일) + 홈 화면 이식까지 완료**, 다음은 검색/상세 화면 + 실데이터 연결.

## 2. 레포 구조 (모노레포, 한 레포)
- `karachato/` = 기존 **Next 앱** — 앞으로 **백엔드 전용**으로 남김 (`/api/cron`·`/api/cron-ai`·`/api/cron-youtube` 크롤 파이프라인 + `/api/chat`·`/api/search`). 웹 프론트는 나중에 은퇴/판단.
- `karachato-app/` = 새 **Vite + React 18 웹뷰 프론트** (앱인토스 본체 + 나중에 웹에도 배포).
- **브랜치: 단일 `dev → main` 유지** (제품별 브랜치 분리 X = 안티패턴). 배포는 폴더별: 웹=`karachato/`→Vercel, 앱→웹=`karachato-app/`→별도 Vercel(root만 다르게), 앱→토스=`ait build`→`.ait` 콘솔 업로드(깃 무관).

## 3. 완료된 것 (커밋됨)
1. `docs:` 마이그레이션 계획 확정 (EPIC §7)
2. `chore:` 웹뷰 앱 스캐폴드 (Vite React-TS, **React 18 고정**)
3. `chore:` `@apps-in-toss/web-framework` 설치 + `ait init` → `granite.config.ts`
4. `chore:` 스타일 파이프라인 (Tailwind v4 + Pretendard @font-face)
5. `feat:` 홈/차트 화면 이식 (목 데이터 렌더)
6. `feat:` 홈 상단 검색바 복구 + 검색 next/* 교체
7. `docs:` 레포 구조·배포 전략 (§7.5)

**지금 동작(갱신):** 홈·검색·상세 3화면 전부 **실제 Supabase 데이터**로 동작 + 설정/챗 모달 연결됨.
- 추가 완료 커밋: 토스 디자인 적응(다크네비바·safe-area·핀치줌·해요체) / **곡 소개 구조화**(설명 산문 + `ai_intro` 리스트 + 곡 소개 카드) + **146곡 백필**(워크플로 웹조사→DB, Gemini 대신 Claude 웹검색) / **S2 실데이터**(공개 SELECT RLS 정책 3테이블 + publishable 키 + 클라 `getChartByProvider`·`getSongById` + `search_songs` RPC) / 설정·챗 모달.
- 로컬 확인: `karachato-app`에서 `npx vite` → 브라우저. `.env.local`(gitignore)에 `VITE_SUPABASE_URL`·`VITE_SUPABASE_PUBLISHABLE_KEY` 있음(없으면 `karachato/.env.local`에서 복사).

## 4. 다음 할 일 (남은 것)
> 홈·검색·상세 3화면 실데이터 + 모달까지 완료. 토스 디자인 적응(다크네비바·safe-area·핀치줌·해요체)도 완료. 남은 건 아래 3~4개.
1. **챗봇 백엔드 연결(S6)** — `/api/chat`(Gemini, 시크릿 필요)은 **Vercel 유지**. `karachato-app` `ChatModal`의 `fetch("/api/chat")`를 절대 URL(`VITE_API_BASE`)로 재지정 + 백엔드 CORS(`*.tossmini.com` 오리진 + 로컬). **검색은 이미 클라 `supabase.rpc('search_songs')`라 백엔드 불필요.** 시크릿 로테이션 권장.
2. **샌드박스 테스트** — `npm run build`(=`ait build`)→`karachato.ait` 콘솔 업로드/`ait deploy`(토큰)→폰으로 실제 토스 렌더 확인.
3. **헤더/네비 최종** — 플랫폼 분기 헬퍼 `lib/platform.ts` `isInTossApp()`(=`window.ReactNativeWebView` 유무, 프레임워크 자체 신호) 신설. 곡 상세는 `DetailHeader`로 **웹=자체 뒤로가기 / 앱=중앙 텍스트 헤더** 분기 완료. **남은 것:** 검색결과 화면(`SearchHeader` mode="search")도 같은 헬퍼로 앱에선 뒤로가기 숨기기. granite.config는 이미 다크 네비바+webViewProps 적용됨.
4. **정리** — 시크릿 누출 정적 감사(client 번들에 `lib/supabase/server`/gemini 미유입 확인), `granite.config` 로고 URL 실제로 교체, dead Next 코드 정리, Storybook/vitest 처리.

## 5. 실행/빌드/확인
- 로컬 웹 확인: `cd karachato-app && npx vite` → `localhost:5173` (그냥 브라우저에서 됨, 토스 프레임워크여도 개발 중엔 웹)
- 앱인토스 빌드: `npm run build`(=`ait build`) → `karachato.ait` (gitignore됨)
- **주의:** `ait build`가 끝나며 `dist/`를 RN 번들로 바꿈. 웹 산출물만 보려면 `npx vite build`.

## 6. 키 사실 / 함정
- **React 18 고정** (프레임워크 요구, Vite 템플릿 기본은 19였음 → 18로 낮춤).
- **`ait init`은 대화형** — 플래그 줘도 중간 프롬프트(dev=`vite`/build=`vite build`/port=`5173`)를 **타이핑**해야 함. 엔터만 누르면 "취소"됨.
- **`granite.config.ts` `brand.icon`은 필수 string(URL)** — 지금 임시 vercel og URL 넣음. 실제 로고 URL로 교체 TODO(급하지 않음).
- **next/* → react-router 패턴**: `next/link` `<Link href>`→`react-router-dom` `<Link to>`; `useRouter().push`→`useNavigate()`; `useSearchParams()`(next)→`const [sp]=useSearchParams()`(rr); `router.back()`→`navigate(-1)`; `next/image`→`<img>`.
- `@/` 별칭: `tsconfig.app.json` paths + `vite.config.ts` resolve.alias 둘 다 설정됨.
- `.stories.*` 파일은 이식 시 제외(storybook 미설치).

## 7. 콘솔/외부 상태 (사용자가 함)
- 앱인토스 콘솔에 앱 등록 완료: **appName=`karachato`(영구·수정불가)**, 앱이름=가라챠토, 유형=비게임, 개인 개발자(사업자 불필요).
- 앱정보 폼 **임시저장 상태** — 카테고리(콘텐츠 권장), 로고(karachato_logo.png 업로드됨), **썸네일(1932×828)·스크린샷은 앱 완성 후**, **검토요청은 아직 X**.
- 디자인 심사: TDS 강제 아님(자체 UI OK), 다크 컨셉 조건부 OK, 로고 600×600 각진 정사각 불투명. 상세는 EPIC §7.4.

## 8. 참고
- 전체 계획/제약/디자인심사: `docs/issues/EPIC-apps-in-toss-migration.md` §7
- 메모리(자동 로드): apps-in-toss-migration-progress, apps-in-toss-design-review, apps-in-toss-individual-launch-ok, deploy-branch-main, commit-coauthor-format
- 커밋 컨벤션: `COMMIT_CONVENTION.md`(로컬, gitignore) — `type: 한글요약` + `Co-authored-by: Claude <noreply@anthropic.com>`
