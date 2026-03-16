import type { Meta, StoryObj } from "@storybook/nextjs";
import ChartList from "./ChartList";
import { MOCK_CHART_ITEMS } from "@/lib/mock/chartItems";

const meta: Meta<typeof ChartList> = {
  component: ChartList,
  title: "components/chart/ChartList",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChartList>;

export const Default: Story = {
  args: {
    items: MOCK_CHART_ITEMS,
  },
};
