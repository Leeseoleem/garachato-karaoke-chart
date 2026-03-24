import type { Meta, StoryObj } from "@storybook/nextjs";
import SearchSection from "./index";

const meta: Meta<typeof SearchSection> = {
  component: SearchSection,
  title: "search/SearchSection",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchSection>;

export const Default: Story = {
  render: () => <SearchSection />,
};
