import type { Meta, StoryObj } from "@storybook/nextjs";
import SearchResultItem from "./SearchResultItem";

const meta: Meta<typeof SearchResultItem> = {
  component: SearchResultItem,
  title: "search/SearchResultItem",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchResultItem>;

const base = {
  titleNorm: "IRIS OUT(劇場版 チェンソーマン)",
  artistNorm: "米津玄師",
  songId: "1",
};

// TJ + KY 둘 다 있는 경우
export const Both: Story = {
  args: {
    ...base,
    tracks: [
      { provider: "TJ", karaokeNo: "12115" },
      { provider: "KY", karaokeNo: "12115" },
    ],
  },
};

// TJ만 있는 경우
export const TJOnly: Story = {
  args: {
    ...base,
    tracks: [{ provider: "TJ", karaokeNo: "12115" }],
  },
};

// KY 번호 없는 경우
export const KYWithoutNo: Story = {
  args: {
    ...base,
    tracks: [{ provider: "TJ", karaokeNo: "12115" }, { provider: "KY" }],
  },
};
