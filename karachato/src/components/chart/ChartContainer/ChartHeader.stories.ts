import type { Meta, StoryObj } from "@storybook/nextjs";
import ChartHeader from "./ChartHeader";

const meta: Meta<typeof ChartHeader> = {
  component: ChartHeader,
  title: "chart/ChartHeader",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChartHeader>;

export const Default: Story = {};
