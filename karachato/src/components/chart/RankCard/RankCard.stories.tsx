import type { Meta, StoryObj } from "@storybook/nextjs";
import RankCard from "./index";
import { useChartStore } from "@/store/chartStore";

const meta: Meta<typeof RankCard> = {
  component: RankCard,
  title: "components/chart/RankCard",
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      useChartStore.setState({
        displayMode: "translated",
        translationScope: "jp_only",
      });
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RankCard>;

const baseArgs = {
  songId: "a3f9c2d1-0001-4a5b-8c9d-000000000001",
  rank: { rank: 1, status: "UP" as const },
  song: {
    titleInProvider: "アイドル/IDOL",
    titleKoJp: "아이돌/IDOL",
    titleKoFull: "아이돌/아이돌",
    artistInProvider: "YOASOBI",
  },
  action: {
    karaokeNo: "82548",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  },
};

// 번역 모드 - 일본어만
export const TranslatedJpOnly: Story = {
  args: baseArgs,
  decorators: [
    (Story) => {
      useChartStore.setState({
        displayMode: "translated",
        translationScope: "jp_only",
      });
      return <Story />;
    },
  ],
};

// 번역 모드 - 영어까지
export const TranslatedFull: Story = {
  args: baseArgs,
  decorators: [
    (Story) => {
      useChartStore.setState({
        displayMode: "translated",
        translationScope: "full",
      });
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

// 번역 없는 곡 (ai_status: pending)
export const NoTranslation: Story = {
  args: {
    ...baseArgs,
    song: {
      ...baseArgs.song,
      titleKoJp: null,
      titleKoFull: null,
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

// SAME
export const RankSame: Story = {
  args: {
    ...baseArgs,
    rank: { rank: 3, status: "SAME" as const },
  },
};

// UNKNOWN (첫 크롤링)
export const RankUnknown: Story = {
  args: {
    ...baseArgs,
    rank: { rank: 10, status: "UNKNOWN" as const },
  },
};
