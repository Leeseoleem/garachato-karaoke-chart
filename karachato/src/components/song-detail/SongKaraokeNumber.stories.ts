import type { Meta, StoryObj } from "@storybook/nextjs";
import SongKaraokeNumber from "./SongKaraokeNumber";

const meta: Meta<typeof SongKaraokeNumber> = {
  component: SongKaraokeNumber,
  title: "song-detail/SongKaraokeNumber",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SongKaraokeNumber>;

export const TJ: Story = {
  args: {
    provider: "TJ",
    karaokeNo: "12113",
  },
};

export const KY: Story = {
  args: {
    provider: "KY",
    karaokeNo: "12113",
  },
};

export const NoNumber: Story = {
  args: {
    provider: "KY",
  },
};
