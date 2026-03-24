import type { Meta, StoryObj } from "@storybook/nextjs";
import SongHeroSection from "./SongHeroSection";

const meta: Meta<typeof SongHeroSection> = {
  title: "song-detail/SongHeroSection",
  component: SongHeroSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SongHeroSection>;

export const WithThumbnail: Story = {
  args: {
    titleKo: "아이돌 / IDOL",
    titleInProvider: "アイドル / IDOL",
    artistInProvider: "YOASOBI",
    artistKo: "요아소비",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    youtubeVideoId: "dQw4w9WgXcQ",
  },
};

export const WithoutThumbnail: Story = {
  args: {
    titleKo: "아이돌 / IDOL",
    titleInProvider: "アイドル / IDOL",
    artistInProvider: "YOASOBI",
    artistKo: "요아소비",
    thumbnailUrl: null,
    youtubeVideoId: null,
  },
};

export const WithVideoIdOnly: Story = {
  args: {
    titleKo: "아이돌 / IDOL",
    titleInProvider: "アイドル / IDOL",
    artistInProvider: "YOASOBI",
    artistKo: "요아소비",
    thumbnailUrl: null,
    youtubeVideoId: "dQw4w9WgXcQ",
  },
};
