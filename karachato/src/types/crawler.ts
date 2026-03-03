/**
 * TJ API 원본 필드명 대응 타입
 */
export interface TJSong {
  rank: number; // 순위 (1~100)
  karaoke_no: string; // 노래방 번호. 예: "68058"
  title: string; // 곡명 원문 (일본어). 예: "Pretender"
  artist: string; // 가수명 원문 (일본어). 예: "Official髭男dism"
  imgthumb_path: string; // TJ 앨범 썸네일 URL. 예: "https://www.tjmedia.com/.../068058_thumb.jpg"
}
