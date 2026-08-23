import type { ToolIconName } from "./icons";

export type ToolCategory = "PDF" | "Images" | "Security" | "Utilities" | "Video & Audio";

export interface ToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  icon: ToolIconName;
  category: ToolCategory;
  /** Marked for tools that are registered but not yet shipped; links are disabled. */
  planned?: boolean;
}
