import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import SearchInput from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  component: SearchInput,
  title: "Search/SearchInput",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return <SearchInput value={value} onChange={setValue} />;
  },
};
