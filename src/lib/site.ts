import { getToolBySlug } from "@/features/tools/tool-registry";
import type { Metadata } from "next";

export const SITE_NAME = "InBrowser";

export const SITE_TAGLINE =
  "The ultimate privacy-first toolkit. Convert media, manage PDFs, generate developer tools, and more — all locally in your browser.";

/**
 * Public origin for sitemap/canonical links. Override in Netlify project
 * settings (NEXT_PUBLIC_SITE_URL). The fallback is an RFC 2606 reserved
 * domain so a misconfigured deploy never points at a real site.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://inbrowserkit.vercel.app";

export function toolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);
  const title = tool ? tool.name : SITE_NAME;
  const description = tool
    ? `${tool.tagline} 100% free and processed locally in your browser.`
    : SITE_TAGLINE;
  const url = tool ? `${SITE_URL}/tools/${tool.slug}` : SITE_URL;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: `${title} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@inbrowser",
      creator: "@inbrowser",
      title,
      description,
      images: ["/opengraph-image.png"],
    },
    other: {
      "application-name": SITE_NAME,
    },
  };
}