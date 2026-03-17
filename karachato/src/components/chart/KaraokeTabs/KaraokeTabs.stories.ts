import type { Meta, StoryObj } from "@storybook/nextjs";
import KaraokeTabs from "./index";

const meta: Meta<typeof KaraokeTabs> = {
  component: KaraokeTabs,
  title: "components/chart/KaraokeTabs",
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        push: () => {},
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof KaraokeTabs>;

export const Default: Story = {};
