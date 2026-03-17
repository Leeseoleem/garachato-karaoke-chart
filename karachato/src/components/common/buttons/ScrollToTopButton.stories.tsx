import type { Meta, StoryObj } from "@storybook/nextjs";
import ScrollToTopButton from "./ScrollToTopButton";

const meta: Meta<typeof ScrollToTopButton> = {
  component: ScrollToTopButton,
  title: "Components/common/buttons/ScrollToTopButton",
  tags: ["autodocs"],
  args: {
    onClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ScrollToTopButton>;

export const Default: Story = {};
