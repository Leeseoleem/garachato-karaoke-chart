# 🎤 가라챠토!(カラチャート!): 노래방 일본곡 순위 TOP 100 번역기


<b>가라챠토</b>는
노래방에서 일본 노래를 고를 때 느껴지는
작은 불편함에서 출발한 서비스입니다.

일본어로만 적힌 제목, <br/>
이 노래가 아는 곡인지 아닌지 확인하려고 반복하게 되는 검색, <br/>
그리고 노래를 고르다 흐름이 끊기는 순간들.

가라챠토는 이런 상황에서 생기는 언어의 장벽과 번거로운 확인 과정을 줄이고, <br/>
지금 많이 불리는 일본 노래들을 조금 더 편하게 살펴볼 수 있도록 도와줍니다. <br/>
굳이 검색을 거치지 않아도, 노래를 고르는 데 필요한 정보만
가볍게 확인할 수 있도록 구성했습니다.

---

## 2. 주요 기능

* 🎶 **TJ / 금영 일본곡 TOP 100 순위 제공**
* 🌏 **Papago API 기반 일본어 → 한국어 자동 번역**
* ▶️ **YouTube 영상 자동 연동 (캐싱 적용)**
* 🏷️ 곡 제목·가수 기반 **태그 / 카테고리 자동 생성**
* 🔎 제목 / 가수 / 곡 번호 / 태그 **통합 검색**
* 🤖 **버튼형 챗봇 필터링** (카테고리·태그 기반)
* ⏱️ **2주 주기 자동 데이터 업데이트 (Cron Job)**

---

## 3. 기술 스택

### Frontend

* Next.js (App Router)
* TypeScript

### Backend

* Next.js Route Handlers (`app/api`)
* Node.js 기반 자동화 로직

### Database

* Supabase (PostgreSQL)

### External APIs

* Papago Translation API
* Google Custom Search API (YouTube ID 검색)
* YouTube iframe embed

### Deployment & Automation

* Vercel
* Vercel Cron Jobs

---

## 4. 프로젝트 구조

```text
src/
 ├─ app/
 │   ├─ api/
 │   │   ├─ automation/        # 순위 수집 및 자동화 처리
 │   │   ├─ search/            # 통합 검색 API
 │   │   ├─ song-detail/       # 유튜브 캐싱 API
 │   │   └─ chatbot-intent/    # 챗봇 필터 API
 │   └─ page.js                # 메인 페이지
 │
 ├─ lib/
 │   └─ supabase/              # Supabase 클라이언트 (server/admin 분리)
 │
 └─ services/
     └─ automation/            # 번역 / 유튜브 검색 / 태그 분류 로직
```

### 구조 설계 의도

* **API Route 단위로 책임 분리**
* 자동화 로직은 `services/automation`으로 분리하여 재사용 가능하게 설계
* 프론트엔드에서 백엔드 구조를 쉽게 추적할 수 있도록 단순화

---

## 5. 컨벤션 가이드

### 📁 폴더 / 파일 컨벤션

* API는 반드시 `app/api/{기능명}/route.js` 형태 사용
* 자동화 관련 로직은 `services/automation` 하위에만 작성
* Supabase 클라이언트는 **server / admin 분리**

### 🧩 네이밍 컨벤션

* API Route: `kebab-case`

  * 예: `song-detail`, `chatbot-intent`
* 변수 / 함수: `camelCase`
* DB 컬럼: `snake_case`

### 🔐 보안 컨벤션

* `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용
* 외부 API 키는 `.env.local` 관리
* Cron 호출 시 Secret Header 검증 필수

---

## 6. API 명세 (요약)

### `GET /api/automation/scrape-process`

| 항목    | 설명                             |
| ----- | ------------------------------ |
| 기능    | 순위 스크랩 및 신규 곡 자동 처리            |
| 방식    | 크론 잡 / 수동 호출                   |
| 주요 처리 | 스크랩 → DB 비교 → 번역 → 유튜브 → 태그 생성 |

---

### `GET /api/search?q=keyword&vendor=TJ`

| 항목    | 설명                      |
| ----- | ----------------------- |
| 기능    | 통합 검색                   |
| 검색 대상 | 제목, 번역 제목, 가수, 곡 번호, 태그 |
| 응답    | 필터링된 곡 리스트              |

---

### `GET /api/song-detail?vendor=TJ&songNo=XXXX`

| 항목    | 설명                |
| ----- | ----------------- |
| 기능    | 노래 상세 정보 + 유튜브 캐싱 |
| 특징    | DB 캐시 우선 조회       |
| 캐시 미스 | 검색 후 저장           |

---

### `GET /api/chatbot-intent?intent=anime`

| 항목 | 설명              |
| -- | --------------- |
| 기능 | 챗봇 버튼 기반 필터링    |
| 기준 | category / tags |

---

## 7. 서비스 화면 소개 (Start Here)

1. **메인 화면**

   * TJ / 금영 탭 전환
   * 일본곡 TOP 100 순위 리스트 표시

2. **검색 기능**

   * 키워드 입력 시 실시간 필터링
   * 제목·가수·태그 동시 검색

3. **상세 모달**

   * 곡 정보 표시
   * 유튜브 영상 자동 재생

4. **챗봇 필터**

   * 버튼 클릭으로 카테고리별 추천 곡 조회

---
