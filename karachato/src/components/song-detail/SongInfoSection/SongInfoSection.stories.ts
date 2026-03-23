import type { Meta, StoryObj } from "@storybook/nextjs";
import SongInfoSection from ".";

const meta: Meta<typeof SongInfoSection> = {
  component: SongInfoSection,
  title: "song-detail/SongInfoSection",
  tags: ["autodocs"],
  args: {
    description:
      "노래에 대한 설명이 들어가는 공간입니다.\n설명은 여러 줄이 들어옵니다.",
    tags: ["J-POP", "최신곡"],
  },
};

export default meta;
type Story = StoryObj<typeof SongInfoSection>;

export const Default: Story = {
  args: {
    rankInfo: {
      currentRank: 1,
      currentStatus: "UP",
      previousRank: 3,
    },
  },
};

export const New: Story = {
  args: {
    rankInfo: {
      currentRank: 3,
      currentStatus: "UNKNOWN",
      previousRank: null,
    },
  },
};
