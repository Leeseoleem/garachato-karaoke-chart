// 문자열 관련 유틸 함수

export function normalize(str: string): string {
  return str
    .replace(/\(.*?\)/g, "") // (반각 괄호 안 내용) 제거
    .replace(/\uff08.*?\uff09/g, "") // （전각 괄호 안 내용） 제거
    .replace(/[^\w\s\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7A3]/g, "") // 특수문자 제거
    .replace(/\s+/g, " ") // 연속 공백 → 공백 하나로
    .trim()
    .toLowerCase();
}

export function escapePostgrestValue(value: string): string {
  // PostgREST or() 필터에서 구분자로 사용되는 문자 이스케이프
  return value.replace(/[,%()]/g, "");
}
