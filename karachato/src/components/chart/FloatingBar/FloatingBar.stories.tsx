import type { Meta, StoryObj } from "@storybook/nextjs";
import FloatingBar from ".";

const meta: Meta<typeof FloatingBar> = {
  component: FloatingBar,
  title: "chart/FloatingBar/FloatingBar",
  tags: ["autodocs"],
  args: {
    onScrollToTop: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FloatingBar>;

export const Default: Story = {
  args: {
    isScrolled: false,
  },
};

export const Scroll: Story = {
  args: {
    isScrolled: true,
  },
};
