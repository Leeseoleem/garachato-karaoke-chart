import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";

import { SITE_URL } from "@/constants/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const { data: songs } = await supabase
    .from("songs")
    .select("id, updated_at")
    .eq("ai_status", "done");

  const songUrls =
    songs?.map((song) => ({
      url: `${SITE_URL}/song/${song.id}`,
      lastModified: song.updated_at ? new Date(song.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) ?? [];

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...songUrls,
  ];
}
