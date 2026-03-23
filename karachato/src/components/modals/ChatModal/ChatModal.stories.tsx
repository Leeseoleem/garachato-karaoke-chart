import type { Meta, StoryObj } from "@storybook/nextjs";
import ChatModal from "./index";
import { useChatStore } from "@/store/chatStore";
import { CHAT_WELCOME_MESSAGE } from "@/constants/chat";

const meta: Meta<typeof ChatModal> = {
  title: "Modals/ChatModal",
  component: ChatModal,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      useChatStore.setState({ isChatOpen: true });
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ChatModal>;

export const Default: Story = {};

export const SongCandidate: Story = {
  args: {
    initialMessages: [
      {
        type: "text",
        role: "model",
        message: CHAT_WELCOME_MESSAGE,
      },
      {
        type: "text",
        role: "user",
        message: "요아소비 노래 찾아줘",
      },
      {
        type: "song_candidate",
        role: "model",
        message: "이 노래 맞나요?",
        song_id: "a3f9c2d1",
        song: {
          songId: "a3f9c2d1",
          titleKo: "아이돌/IDOL",
          titleInProvider: "アイドル/IDOL",
          artistInProvider: "YOASOBI",
          karaokeTracks: [{ provider: "TJ", karaokeNo: "82548" }],
          isInTop100: true,
        },
      },
    ],
  },
};

export const Confirmed: Story = {
  args: {
    initialMessages: [
      {
        type: "text",
        role: "model",
        message: CHAT_WELCOME_MESSAGE,
      },
      {
        type: "text",
        role: "user",
        message: "요아소비 노래 찾아줘",
      },
      {
        type: "confirmed",
        role: "model",
        song_id: "a3f9c2d1",
        message: "찾으셨군요! 즐거운 시간 되세요 🎤",
      },
    ],
  },
};

export const OffTopic: Story = {
  args: {
    initialMessages: [
      {
        type: "text",
        role: "model",
        message: CHAT_WELCOME_MESSAGE,
      },
      {
        type: "text",
        role: "user",
        message: "오늘 날씨 어때?",
      },
      {
        type: "off_topic",
        role: "model",
        message: "저는 노래 관련 질문만 답변할 수 있어요!",
      },
    ],
  },
};

export const Error: Story = {
  args: {
    initialMessages: [
      {
        type: "text",
        role: "model",
        message: CHAT_WELCOME_MESSAGE,
      },
      {
        type: "error",
        role: "model",
        message: "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      },
    ],
  },
};
