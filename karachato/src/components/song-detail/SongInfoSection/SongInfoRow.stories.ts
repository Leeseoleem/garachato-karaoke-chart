import type { Meta, StoryObj } from "@storybook/nextjs";
import SongInfoRow from "./SongInfoRow";

const meta: Meta<typeof SongInfoRow> = {
  component: SongInfoRow,
  title: "song-detail/SongInfoRow",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SongInfoRow>;

export const ChartUp: Story = {
  args: { label: "차트 순위", status: "UP", rank: 10 },
};

export const ChartSame: Story = {
  args: { label: "차트 순위", status: "SAME", rank: 10 },
};

export const Recent: Story = {
  args: { label: "전주 순위", rank: 10 },
};
