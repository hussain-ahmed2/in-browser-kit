import { getToolBySlug } from "@/features/tools/tool-registry";

export const SITE_NAME = "InBrowser";

export const SITE_TAGLINE =
  "Privacy-first file tools. Compress images, merge PDFs, and more — all in your browser.";

/**
 * Public origin for sitemap/canonical links. Override in Vercel project
 * settings (NEXT_PUBLIC_SITE_URL). The fallback is an RFC 2606 reserved
 * domain so a misconfigured deploy never points at a real site.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://inbrowserkit.vercel.app";

export function toolMetadata(slug: string) {
  const tool = getToolBySlug(slug);
  return {
    title: tool ? tool.name : SITE_NAME,
    description: tool
      ? `${tool.tagline} 100% free and processed locally in your browser.`
      : SITE_TAGLINE,
  };
}