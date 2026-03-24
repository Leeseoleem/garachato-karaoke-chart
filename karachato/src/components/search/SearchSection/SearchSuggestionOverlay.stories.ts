import type { Meta, StoryObj } from "@storybook/nextjs";
import SearchSuggestionOverlay from "./SearchSuggestionOverlay";

const meta: Meta<typeof SearchSuggestionOverlay> = {
  component: SearchSuggestionOverlay,
  title: "Search/SearchSuggestionOverlay",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchSuggestionOverlay>;

const MOCK_KEYWORDS = ["체인소맨", "米津玄師", "YOASOBI", "베텔기우스"];

export const Default: Story = {
  args: {
    keywords: MOCK_KEYWORDS,
  },
};

export const Empty: Story = {
  args: {
    keywords: [],
  },
};

export const NoKeywords: Story = {
  args: {
    keywords: undefined,
  },
};
