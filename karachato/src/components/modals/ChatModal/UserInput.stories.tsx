import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import UserInput from "./UserInput";

const meta: Meta<typeof UserInput> = {
  title: "UI/Chat/UserInput",
  component: UserInput,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="relative h-full w-full  mx-auto bg-gray-50">
        <div className="sticky bottom-0 w-full p-4">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserInput>;

// 기본 상태 (controlled)
const ControlledTemplate = (args: React.ComponentProps<typeof UserInput>) => {
  const [value, setValue] = useState("");
  return <UserInput {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: (args) => <ControlledTemplate {...args} />,
};

// 값이 입력된 상태
export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = useState("아이돌 - YOASOBI");
    return <UserInput {...args} value={value} onChange={setValue} />;
  },
};

// 멀티라인 상태
export const Multiline: Story = {
  render: (args) => {
    const [value, setValue] = useState(
      "첫 번째 줄\n두 번째 줄\n세 번째 줄\n네 번째 줄",
    );
    return <UserInput {...args} value={value} onChange={setValue} />;
  },
};

// 최대 높이 초과 (스크롤)
export const OverflowScroll: Story = {
  render: (args) => {
    const [value, setValue] = useState(
      Array(10).fill("긴 텍스트 입력 테스트").join("\n"),
    );
    return <UserInput {...args} value={value} onChange={setValue} />;
  },
};

// disabled 상태
export const Disabled: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    disabled: true,
  },
};
