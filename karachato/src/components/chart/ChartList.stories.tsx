import type { Meta, StoryObj } from "@storybook/nextjs";
import ChartList from "./ChartList";
import { MOCK_CHART_ITEMS } from "@/lib/mock/chartItems";
import { useChartStore } from "@/store/chartStore";

const meta: Meta<typeof ChartList> = {
  component: ChartList,
  title: "components/chart/ChartList",
  tags: ["autodocs"],
  args: {
    items: MOCK_CHART_ITEMS,
  },
};

export default meta;
type Story = StoryObj<typeof ChartList>;

export const Default: Story = {
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

export const Full: Story = {
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

export const Original: Story = {
  decorators: [
    (Story) => {
      useChartStore.setState({ displayMode: "original" });
      return <Story />;
    },
  ],
};
