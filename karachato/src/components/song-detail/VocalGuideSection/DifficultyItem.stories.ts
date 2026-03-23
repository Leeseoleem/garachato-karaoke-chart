import type { Meta, StoryObj } from "@storybook/nextjs";
import DifficultyItem from "./DifficultyItem";

const meta: Meta<typeof DifficultyItem> = {
  component: DifficultyItem,
  title: "song-detail/DifficultyItem",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DifficultyItem>;

export const TJ: Story = {
  args: {
    label: "보컬 난이도",
    score: 3,
    reason:
      "넓은 음역대와 깊은 감정 표현이 요구되며, 특히 후렴구의 고음부가 난이도가 있어 안정적인 가창력이 필요합니다.",
  },
};
