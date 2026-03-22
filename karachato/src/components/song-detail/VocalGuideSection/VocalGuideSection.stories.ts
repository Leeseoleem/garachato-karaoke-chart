import type { Meta, StoryObj } from "@storybook/nextjs";
import VocalGuideSection from ".";

const meta: Meta<typeof VocalGuideSection> = {
  component: VocalGuideSection,
  title: "song-detail/VocalGuideSection",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof VocalGuideSection>;

export const Default: Story = {
  args: {
    vocalDifficult: {
      score: 3,
      reason:
        "넓은 음역대와 깊은 감정 표현이 요구되며, 특히 후렴구의 고음부가 난이도가 있어 안정적인 가창력이 필요합니다.",
    },
    PronunciationDifficult: {
      score: 3,
      reason:
        "일반적인 일본어 발음으로 이루어져 있지만, 빠르게 이어지는 부분이나 감정을 담아 부를 때 자연스러운 흐름이 중요합니다.",
    },
    tags: ["강렬한", "폭팔적인", "신나는"],
    tip: "후렴구의 고음을 시원하게 내지르는 연습을 하고, 곡 전체에 담긴 아련하고 희망찬 메시지를 이해하며 감정을 실어 부르면 더욱 좋습니다.",
  },
};
