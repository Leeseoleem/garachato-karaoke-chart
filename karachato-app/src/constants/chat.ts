// 퀵버튼용 유명 가수. DB에 곡이 있고 한글명으로 검색이 실제 되는 것만 (곡수 상위 큐레이션).
export const ARTIST_KO_MAP = {
  YOASOBI: "요아소비",
  米津玄師: "요네즈 켄시",
  Ado: "아도",
  あいみょん: "아이묭",
  Official髭男dism: "히게단",
  "Mrs. Green Apple": "미세스 그린 애플",
  "back number": "백넘버",
  Vaundy: "바운디",
  ヨルシカ: "요루시카",
  優里: "유우리",
  "King Gnu": "킹누",
} as const;

// DB에 곡이 있는 보컬로이드 전체. flower는 DB표기가 "Flower"(영어)라 값도 영어.
export const VOCALOID_KO_MAP = {
  初音ミク: "하츠네 미쿠",
  鏡音リン: "카가미네 린",
  鏡音レン: "카가미네 렌",
  巡音ルカ: "메구리네 루카",
  重音テト: "카사네 테토",
  GUMI: "구미",
  IA: "IA",
  可不: "카후",
  歌愛ユキ: "카아이 유키",
  flower: "flower",
} as const;

export const STATIC_QUICK_QUESTIONS = [
  "요즘 나온 신곡 추천해줘",
  "요즘 순위 오른 곡 알려줘",
  "노래방에 새로 들어온 곡 알려줘",
] as const;

// constants/chat.ts

export const CHAT_WELCOME_MESSAGE =
  "안녕하세요! 찾고 싶은 일본 노래가 있으신가요? 곡명이나 가수명을 알려주시면 노래방 번호를 찾아드릴게요 🎤";
