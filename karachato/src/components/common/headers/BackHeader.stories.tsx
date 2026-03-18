import type { Meta, StoryObj } from "@storybook/nextjs";
import BackHeader from "./BackHeader";

const meta: Meta<typeof BackHeader> = {
  component: BackHeader,
  title: "header/BackHeader",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BackHeader>;

export const Default: Story = {};

export const Title: Story = {
  args: {
    title: "곡 상세 정보",
  },
};
