import type { Meta, StoryObj } from "@storybook/nextjs";
import KaraokeTipItem from "./KaraokeTipItem";

const meta: Meta<typeof KaraokeTipItem> = {
  component: KaraokeTipItem,
  title: "song-detail/KaraokeTipItem",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KaraokeTipItem>;

export const TJ: Story = {
  args: {
    tip: "후렴구의 고음을 시원하게 내지르는 연습을 하고, 곡 전체에 담긴 아련하고 희망찬 메시지를 이해하며 감정을 실어 부르면 더욱 좋습니다.",
  },
};
