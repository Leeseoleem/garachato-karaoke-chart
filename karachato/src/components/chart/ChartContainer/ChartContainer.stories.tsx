import type { Meta, StoryObj } from "@storybook/nextjs";
import ChartContainer from ".";

const meta: Meta<typeof ChartContainer> = {
  title: "components/chart/ChartContainer",
  component: ChartContainer,
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {};
