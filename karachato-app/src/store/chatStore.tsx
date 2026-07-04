import { create } from "zustand";

interface ChatStore {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isChatOpen: false,
  setIsChatOpen: (open) => set({ isChatOpen: open }),
}));
