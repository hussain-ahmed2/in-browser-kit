import type { MetadataRoute } from "next";
import { tools } from "@/features/tools/tool-registry";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  for (const tool of tools) {
    if (tool.planned) continue;
    entries.push({
      url: `${SITE_URL}/tools/${tool.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}