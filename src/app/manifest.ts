import type { MetadataRoute } from "next";
import { tools } from "@/features/tools/tool-registry";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "InBrowser",
    description: SITE_TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0284c7",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: tools
      .filter((tool) => !tool.planned)
      .slice(0, 10)
      .map((tool) => ({
        name: tool.name,
        url: `/tools/${tool.slug}`,
      })),
  };
}