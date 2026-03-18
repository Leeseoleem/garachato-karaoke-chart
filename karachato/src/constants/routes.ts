export const ROUTES = {
  HOME: "/",
  SONG: (id: string) => `/song/${id}`,
  SEARCH: "/search",
  CHAT: "/chat",
} as const;
