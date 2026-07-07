/**
 * TJ API 원본 필드명 대응 타입
 */

// TJ API 응답 원본 아이템 타입 (파싱용)
export interface TJApiItem {
  rank: string; // "1" 처럼 문자열로 옴
  pro: number; // 노래방 번호, 숫자로 옴
  indexTitle: string;
  indexSong: string;
  word: string; // 작사가 (현재 안 씀)
  com: string; // 작곡가 (현재 안 씀)
  icongubun: string; // 아이콘 구분 (현재 안 씀)
  mv_yn: string; // MV 여부 "Y" | "N"
  imgthumb_path: string;
}

// TJ API 응답 전체 구조
export interface TJApiResponse {
  resultCode: string;
  resultMsg: string;
  resultData: {
    itemsTotalCount: number;
    items: TJApiItem[];
  };
}

// 실제 사용될 타입
export interface TJSong {
  rank: number; // 순위 (1~100)
  karaoke_no: string; // 노래방 번호. 예: "68058"
  title: string; // 곡명 원문 (일본어). 예: "Pretender"
  artist: string; // 가수명 원문 (일본어). 예: "Official髭男dism"
  imgthumb_path: string; // TJ 앨범 썸네일 URL. 예: "https://www.tjmedia.com/.../068058_thumb.jpg"
}

// 크롤러 공통 입력 타입 (processCrawledSongs 용)
// TJSong은 그대로 호환된다. KY 등 썸네일을 제공하지 않는 provider는 imgthumb_path를 생략한다.
export interface CrawledSong {
  rank: number;
  karaoke_no: string;
  title: string;
  artist: string;
  imgthumb_path?: string; // 썸네일 URL (없는 provider는 undefined)
}
