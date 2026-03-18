import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import SearchHeader from "./SearchHeader";

const meta: Meta<typeof SearchHeader> = {
  component: SearchHeader,
  title: "search/SearchHeader",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchHeader>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <SearchHeader mode="default" search={{ value, onChange: setValue }} />
    );
  },
};

export const Search: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <SearchHeader mode="search" search={{ value, onChange: setValue }} />
    );
  },
};
