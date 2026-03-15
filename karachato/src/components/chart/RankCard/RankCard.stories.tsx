import type { Meta, StoryObj } from "@storybook/nextjs";
import RankCard from "./index";
import { useChartStore } from "@/store/chartStore";

const meta: Meta<typeof RankCard> = {
  component: RankCard,
  title: "components/chart/RankCard",
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      useChartStore.setState({ displayMode: "translated" });
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RankCard>;

const baseArgs = {
  rank: { rank: 1, status: "UP" as const },
  song: {
    titleKoJp: "아이돌",
    titleInProvider: "アイドル",
    artistKo: null,
    artistInProvider: "YOASOBI",
  },
  action: {
    karaokeNo: "82548",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  },
};

// 번역 모드
export const Translated: Story = {
  args: baseArgs,
  decorators: [
    (Story) => {
      useChartStore.setState({ displayMode: "translated" });
      return <Story />;
    },
  ],
};

// 원문 모드
export const Original: Story = {
  args: baseArgs,
  decorators: [
    (Story) => {
      useChartStore.setState({ displayMode: "original" });
      return <Story />;
    },
  ],
};

// 번역 없는 곡 (pending)
export const NoTranslation: Story = {
  args: {
    ...baseArgs,
    song: {
      ...baseArgs.song,
      titleKoJp: null,
    },
  },
};

// NEW 진입
export const NewEntry: Story = {
  args: {
    ...baseArgs,
    rank: { rank: 99, status: "NEW" as const },
  },
};

// DOWN
export const RankDown: Story = {
  args: {
    ...baseArgs,
    rank: { rank: 5, status: "DOWN" as const },
  },
};
