import type { Meta, StoryObj } from "@storybook/nextjs";
import SongCard, { type SongCardProps } from "./SongCard";

const meta: Meta<typeof SongCard> = {
  title: "UI/Chat/SongCard",
  component: SongCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SongCard>;

const base: SongCardProps = {
  songId: "a3f9c2d1-0000-0000-0000-000000000000",
  titleKo: "아이돌 / IDOL",
  titleInProvider: "アイドル / IDOL",
  artistInProvider: "YOASOBI",
  karaokeTracks: [
    { provider: "TJ", karaokeNo: "82548" },
    { provider: "KY", karaokeNo: "99999" },
  ],
  isInTop100: true,
};

const decorator: Story["decorators"] = [];

export const Top100WithBothProviders: Story = {
  args: base,
  decorators: decorator,
};

export const NotInTop100TJOnly: Story = {
  args: {
    ...base,
    titleKo: "군함행진곡",
    titleInProvider: "軍艦行進曲",
    artistInProvider: "Various Artists",
    karaokeTracks: [{ provider: "TJ", karaokeNo: "31245" }],
    isInTop100: false,
  },
  decorators: decorator,
};

export const LongTitle: Story = {
  args: {
    ...base,
    titleKo: "IRIS OUT(극장판 '체인소맨 - 렉킹볼')",
    titleInProvider: "IRIS OUT('劇場版 チェンソーマン―レッキングボール―')",
    artistInProvider: "米津玄師",
    karaokeTracks: [
      { provider: "TJ", karaokeNo: "12115" },
      { provider: "KY", karaokeNo: "12115" },
    ],
    isInTop100: true,
  },
  decorators: decorator,
};

export const NoTranslation: Story = {
  args: {
    ...base,
    titleKo: null,
    titleInProvider: "アイドル / IDOL",
    artistInProvider: "YOASOBI",
    karaokeTracks: [{ provider: "TJ", karaokeNo: "82548" }],
    isInTop100: false,
  },
  decorators: decorator,
};
