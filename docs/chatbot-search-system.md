# 챗봇 & 검색 시스템 (구조·로직 기록)

> 가라챠토(J-POP 노래방 차트)의 검색·챗봇이 "오타·띄어쓰기·발음 표기가 조금 달라도 곡을 찾아주는" 방식으로 재설계된 기록.
> 관련 이슈: [ISSUE-07](issues/ISSUE-07-chatbot-fuzzy-search.md)(퍼지 검색), [ISSUE-08](issues/ISSUE-08-discovery-curation.md)(차트 추천).

## 1. 핵심 구조: 검색 부품은 하나다

검색을 하는 모든 창구가 **같은 Postgres 함수 `search_songs(query text)` 하나**를 공유한다.

| 창구 | 경로 |
|---|---|
| 웹 앱 검색창 | `GET /api/search` → `search_songs` |
| 토스 앱 검색창 | 클라에서 `supabase.rpc("search_songs")` 직접 호출 |
| 챗봇 | `handleSearchSong` / `handleSearchArtist` → `search_songs` |

그래서 **이 함수 하나를 개선하면 세 창구가 동시에 좋아진다.** 검색 개선 작업의 최고 레버리지 지점.

## 2. 검색 매칭 계층 (search_songs 안에서 일어나는 일)

입력 쿼리는 아래 장치들을 **OR로 동시에** 통과시켜 후보를 모으고, 유사도 점수순으로 정렬해 상위 10개를 반환한다.

| 계층 | 기술 | 무엇을 잡나 | 예시 |
|---|---|---|---|
| **정규화** | `normalize()` + SQL `regexp_replace` | 공백·대소문자·괄호 차이를 없앰 | "튜링 러브" ↔ "튜링러브" |
| **부분일치** | `ILIKE '%q%'` | 제목·가수의 정확한 일부 | "사무라이" → 사무라이 하트 |
| **유사도** | pg_trgm `%` 연산자(트라이그램) | 표기 변형·긴 제목의 오타 | "괴수의 꽃노레" → 괴수의 꽃노래 |
| **편집거리** | `fuzzystrmatch` `levenshtein` (≤2) | 짧은 제목의 오타(트라이그램이 약한 구간) | "히치코크" → 히치콕 |
| **prefix 편집거리** | `levenshtein(left(title, len(q)), q)` (≤1) | 부분 제목 + 앞글자 오타 | "하무라이" → 사무라이 하트 |
| **음차 컬럼** | `title_ko_jp` ILIKE/트라이그램 | 발음의 한글 표기 | "밤의 오도리코" → 夜の踊り子 |

### 왜 여러 계층인가
- **트라이그램**은 3글자 조각의 겹침으로 유사도를 잰다. 문자열이 길수록 잘 되지만, "히치콕"(3글자)처럼 짧으면 한 글자만 틀려도 유사도가 임계값(0.3) 아래로 떨어진다.
- 그 빈틈을 **편집거리**(글자 몇 개 고치면 같아지나)가 메운다. 짧은 문자열의 오타에 강하다.
- 부분 제목("하무라이" = "하트" 빠짐)은 전체 편집거리가 커지므로, **앞부분만 잘라 비교**하는 prefix 편집거리를 따로 둔다.

### 정규화 규칙 (`karachato/src/utils/string.ts`)
괄호 안 내용 제거 → 특수문자 제거 → **공백 전부 제거** → 소문자화. 공백 제거는 검색뿐 아니라 크롤 시 **중복 감지**(같은 곡이 띄어쓰기 차이로 두 번 삽입되던 문제, ISSUE-02)에도 도움된다.

## 3. 챗봇 계층 (검색 위에 얹힌 것)

챗봇은 검색 부품을 그대로 쓰되, 그 앞에 **Gemini 기반 의도 파악**을 둔다.

1. **의도 분류** (`intent.ts`): 사용자 문장을 JSON으로 분류. `search_song` / `search_artist` / `recommend` / `unknown`.
   - 모델 폴백: `flash-lite → flash → flash-latest`. 앞 모델이 과부하(503)면 다음으로. `unknown`이 나오면 오분류 의심으로 상위 모델에 재확인.
2. **음차→원어 정규화**: keyword를 실제 발매 표기(원어)로 변환. "피피피피"→"PPPP", "에이도"→"Ado".
3. **`keyword_raw` 병행 검색**: Gemini의 변환이 틀릴 수 있으므로(예: "하므라이 하트"를 엉뚱한 일본어로 변환), **사용자가 친 한글 원문도 함께** `search_songs`에 넣어 병합한다. 변환본과 원문 중 하나라도 맞으면 찾는다.
4. **대화 맥락(멀티턴)**: 최근 대화(`history`), 이미 보여준 곡(`excludeIds`), 직전 의도(`lastIntent`)를 함께 보내 "다른 거", "아니에요" 같은 이어가기를 이해.
5. **옵션 좁히기**: 넓은 가수 검색은 랜덤 1곡 대신 실데이터 기반 선택지 버튼(`option_prompt`)으로 좁힌다.
6. **추천 실데이터화**:
   - "최신곡" = `ai_intro`의 발매/투고일 최신순 (랜덤 아님).
   - 차트 기반: `chart_sort`로 등록순(`created_at`)·순위 상승/하락(`rank_history` delta).

## 4. 기술 스택

| 영역 | 기술 |
|---|---|
| DB | PostgreSQL (Supabase) |
| 퍼지 매칭 | 확장 `pg_trgm`(트라이그램 유사도), `fuzzystrmatch`(Levenshtein) |
| 검색 로직 | SQL 함수 `search_songs` (STABLE, SQL 언어) |
| API | Next.js Route Handlers (`/api/search`, `/api/chat`) |
| 앱 | Vite + React (Apps-in-Toss), `supabase-js` 클라 직접 호출 |
| LLM | Google Gemini (의도 분류 `2.5-flash-lite`+폴백, 곡 소개 그라운딩 `2.5-flash`) |

## 5. DB 변경 이력 (원격 마이그레이션)

- `search_songs_fuzzy_spacing`: 공백 무시 비교 + `title_ko_jp` 트라이그램 + Levenshtein + 유사도순 정렬.
- `search_songs_prefix_fuzzy`: prefix 편집거리 절 추가(부분+앞글자 오타).
- 확장 설치: `fuzzystrmatch`.
- 데이터 백필: `songs`의 `title_norm`/`artist_norm`/`title_ko_norm`/`artist_ko_norm` 공백 제거.

> 이 변경들은 프로덕션 DB에 직접 적용됨. 코드(`normalize`, `keyword_raw` 등)는 브랜치 커밋 상태이며 dev→main 배포 시 신규 크롤 곡에도 반영된다.

## 6. 검증된 케이스

| 입력 | 잡는 계층 | 결과 |
|---|---|---|
| 튜링러부 | 정규화(공백) + 유사도 | 튜링 러브 |
| 히치코크 | 편집거리 | 히치콕 |
| 하무라이 | prefix 편집거리 | 사무라이 하트 |
| 하므라이 하트 | 편집거리 / keyword_raw | 사무라이 하트 |
| 피피피피 | Gemini 음차→PPPP | PPPP |
| 밤의 오도리코 | 음차 컬럼 | 夜の踊り子 |

## 7. 남은 것 (미구현)

- **속성 기반 추림**("여성 보컬 노래"): 보컬 편성 데이터 축이 없음. §아래 접근법 참고.
- **무명곡 로마자 음차**: Gemini가 모르는 곡은 원어 변환이 안 되고, DB에 순수 음차 컬럼이 없음(Phase 3).
- **부분 + 중간글자 오타**: 정보가 극히 적어 무리하게 잡으면 오탐. 근본적 한계.

### (참고) 속성 기반 추림 접근법
1. **데이터 축 신설**: describe 파이프라인에서 각 곡의 **보컬 편성**(남성/여성/혼성/그룹/보컬로이드)을 분류해 `ai_vocal_gender` 같은 컬럼에 저장 + 전곡 백필. `ai_intro`에 이미 "보컬 | X" 항목이 있어 초기값 파싱도 가능.
2. **의도 매핑**: 프롬프트에 "여성 보컬/여자 노래"→female, "듀엣/남녀"→mixed 등.
3. **핸들러 필터**: `handleRecommend`에서 `.eq("ai_vocal_gender", …)`.
4. **주의**: "여성 보컬"(원곡 가수 성별)과 "여자가 부르기 좋은"(음역/키)은 다른 축이다. 후자는 이미 있는 `ai_vocal_score`(난이도)와 연결해야 한다. 보컬로이드·중성 보컬은 별도 분류.
