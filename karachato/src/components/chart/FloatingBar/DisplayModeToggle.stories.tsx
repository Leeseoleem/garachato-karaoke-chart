// DisplayModeToggle.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import DisplayModeToggle from "./DisplayModeToggle";

const meta: Meta<typeof DisplayModeToggle> = {
  title: "chart/FloatingBar/DisplayModeToggle",
  component: DisplayModeToggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DisplayModeToggle>;

export const Default: Story = {};
