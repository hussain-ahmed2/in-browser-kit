export type { ToolIconName, LucideIcon } from "./icons";
export { TOOL_ICON_MAP, getToolIcon } from "./icons";
export type { ToolCategory, ToolDefinition } from "./types";
export { pdfTools } from "./pdf";
export { imageTools } from "./images";
export { securityTools } from "./security";
export { videoAudioTools } from "./video-audio";
export { utilityTools } from "./utilities";

import { pdfTools } from "./pdf";
import { imageTools } from "./images";
import { securityTools } from "./security";
import { videoAudioTools } from "./video-audio";
import { utilityTools } from "./utilities";
import type { ToolCategory, ToolDefinition } from "./types";

export const CATEGORIES: ToolCategory[] = ["PDF", "Images", "Security", "Video & Audio", "Utilities"];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  PDF: "PDF Tools",
  Images: "Image Tools",
  Security: "Password & Security",
  "Video & Audio": "Video & Audio Tools",
  Utilities: "Utilities",
};

/**
 * Single source of truth for every tool on the site. The home page grid,
 * the header navigation, and per-tool SEO metadata are all derived from
 * this list — adding a tool is one entry here plus one route/page.
 */
export const tools: ToolDefinition[] = [
  ...pdfTools,
  ...imageTools,
  ...securityTools,
  ...videoAudioTools,
  ...utilityTools,
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}
