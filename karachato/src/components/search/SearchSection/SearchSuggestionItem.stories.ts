import type { Meta, StoryObj } from "@storybook/nextjs";
import SearchSuggestionItem from "./SearchSuggestionItem";

const meta: Meta<typeof SearchSuggestionItem> = {
  component: SearchSuggestionItem,
  title: "Search/SearchSuggestionItem",
  tags: ["autodocs"],
  args: {
    keyword: "체인소맨",
  },
};

export default meta;
type Story = StoryObj<typeof SearchSuggestionItem>;

export const Default: Story = {};
