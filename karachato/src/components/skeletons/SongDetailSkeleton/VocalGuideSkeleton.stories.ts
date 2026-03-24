import type { Meta, StoryObj } from "@storybook/nextjs";
import { VocalGuideSkeleton } from "./VocalGuideSkeleton";

const meta: Meta<typeof VocalGuideSkeleton> = {
  component: VocalGuideSkeleton,
  title: "Skeleton/VocalGuideSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof VocalGuideSkeleton>;

export const Default: Story = {};
