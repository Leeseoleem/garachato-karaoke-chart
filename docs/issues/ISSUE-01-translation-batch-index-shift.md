---
id: ISSUE-01
title: 번역 배치 인덱스 시프트 버그
cycle: 1
priority: P0
status: 해결됨
labels: [bug, data-integrity, ai-pipeline]
created: 2026-07-02
related: [ISSUE-02, ISSUE-03, ISSUE-04]
---

# ISSUE-01 · 번역 배치 인덱스 시프트 버그

## 1. 요약 (TL;DR)

단일 버그가 세 증상을 모두 유발한다. 배치 번역 결과를 곡에 매핑할 때
`results[input.index]`로 접근하는데, `translateSongBatch`는 입력 배열의 **물리적 순서**대로
결과를 반환한다. 트랙 0개인 고아 곡([ISSUE-02](ISSUE-02-orphan-song-records.md))이 배치에서
`continue`로 건너뛰어지면 물리 인덱스와 `input.index`가 어긋나,
**(1) 번역이 인접한 다음 곡에 잘못 저장되고(오연결)**,
**(2) 체인 끝 곡은 `undefined`가 되어 pending에 영구 잔존**한다.

## 2. 증상 (Symptoms)

- DB에 번역이 **한 칸씩 밀려** 저장됨. 각 곡에 "바로 다음 곡"의 번역이 들어감.

  | title_norm (원문) | artist_norm | 저장된 title_ko | 저장된 artist_ko |
  |---|---|---|---|
  | 可愛くてごめん | honeyworks | 벚꽃 너 나(SAKURA KIMI…) | tuki. |
  | ヒッチコック | ヨルシカ | 튜링 러브 | 나나오 아카리(Feat.Sou) |
  | フォニイ | ツミキ | 히치콕 | 요루시카 |
  | 踊 | ado | 밤의 댄서 | 사카낙션 |

- 신규 진입곡이 계속 `ai_status='pending'`으로 남음 (2026-07-02 기준 `チューリングラブ` 77위, `サクラキミワタシ` 95위).
- 3월 등록 곡들은 정상 → 고아 곡이 등장한 이후 배치부터 오염 시작.

## 3. 근본 원인 분석 (Root Cause)

### 코드 위치

- `karachato/src/lib/gemini/translate.ts:246-255` — `translateSongBatch`는 `find`로 index 매핑은
  맞지만, **입력 순서 배열**을 반환한다.
  ```ts
  return songs.map((s) => {
    const item = parsed.find((p) => p.index === s.index);
    ...
    return item; // 배열의 물리적 위치 = batchInputs의 순서
  });
  ```
- `karachato/src/lib/ai/process.ts:58-61` — 트랙 0개 곡을 batchInputs에서 제외.
  ```ts
  if (!tracks || tracks.length === 0) { console.error(...); continue; }
  ```
- `karachato/src/lib/ai/process.ts:88-96` — 결과를 `input.index`(원래 chunk의 순번 j)로 접근.
  ```ts
  for (const input of batchInputs) {
    const result = results[input.index]; // ← 물리 인덱스 ≠ input.index
    if (!result) { ...; continue; }       // ← 끝 곡은 undefined → pending
  ```
- 동일 버그가 `processArtistKo`(process.ts:289~)에도 존재.

### 메커니즘 (한 칸 밀림의 재현)

chunk 맨 앞에 고아 곡(j=0)이 있으면:
- `batchInputs = [{index:1}, {index:2}, {index:3}, ...]` (물리 배열 0,1,2…)
- `results` 물리 배열 = `[r1, r2, r3, ...]`
- 매핑 결과: `results[1]=r2`(밀림), `results[2]=r3`(밀림) … 마지막 `results[N]=undefined`(pending)

고아 곡의 위치·개수에 따라 시프트 폭이 달라져, 오염 경계가 배치마다 다르다.

### 근거 (검증됨)

- `gemini-2.5-flash`에 실제 pending 신규곡 2곡을 배치로 직접 호출 → HTTP 200, 완벽 번역
  (`사쿠라 키미 와타시 / 츠키.`, `튜링 러브 / 나나오아카리`). **모델·곡은 정상, 코드 버그 확정.**

## 4. 영향 범위 (Impact)

- `songs.title_ko / artist_ko / description / ai_*`, `karaoke_tracks.title_ko_jp / title_ko_full / artist_ko`
  및 `_norm` 파생 컬럼까지 오염 가능.
- done 143곡 중 고아 곡 등장 이후 처리분 다수 의심 → 전수 재검증 필요([ISSUE-03](ISSUE-03-translation-data-recovery.md)).
- 검색·차트·상세·챗봇 모든 표시가 잘못된 번역을 노출.

## 5. 해결 방안 (Proposed Fix)

1. **매핑을 index 기준으로 정합화.** 택1:
   - `translateSongBatch`가 `index → result` 맵(또는 객체)을 반환하도록 변경하고 process에서 `map.get(input.index)`로 접근, 또는
   - process에서 반환 배열을 순서 그대로 순회(`results[i]`가 아니라 `batchInputs[i]`와 zip).
2. `processArtistKo`도 동일하게 수정.
3. 수정 후 [ISSUE-03](ISSUE-03-translation-data-recovery.md) 복구 절차 실행.
4. (예방) [ISSUE-02](ISSUE-02-orphan-song-records.md)의 고아 레코드가 애초에 batchInputs 흐름에
   섞이지 않도록 상류에서 차단.

## 6. 해결 로그 (Resolution Log)

> 상태: **해결됨 (2026-07-02).**

### 조치 (Actions)
- `lib/ai/process.ts`: 배치 결과 접근을 `results[input.index]`(chunk 순번 j)에서 배열 순서 `results[k]`로 변경. `processPendingSongs`·`processArtistKo` 모두 `for (const input of batchInputs)` → `for (let k = 0; k < batchInputs.length; k++)`로 교체. `translateSongBatch`가 입력 순서 배열을 반환하므로 물리 인덱스와 정합.

### 결과 (Outcome)
- 트랙 0개 고아 곡이 배치에 섞여도 인덱스 시프트가 발생하지 않음. 번역 밀림·pending 잔존 해소.

### 검증 (Verification)
- 오염 14곡 재번역 후 title_norm↔title_ko 전수 정합 확인, pending=0, 전체 145곡 done. tsc 통과.

### 관련 커밋/PR
- 브랜치 `fix/translation-integrity`, 커밋 `2a261d4`.
