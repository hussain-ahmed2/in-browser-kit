import {
  Image,
  FileDown,
  KeyRound,
  Fingerprint,
  Scissors,
  RotateCw,
  FileX2,
  LockKeyhole,
  Crop,
  FileImage,
  QrCode,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "PDF" | "Images" | "Security" | "Utilities";

export interface ToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  category: ToolCategory;
  /** Marked for tools that are registered but not yet shipped; links are disabled. */
  planned?: boolean;
}

export const CATEGORIES: ToolCategory[] = ["PDF", "Images", "Security", "Utilities"];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  PDF: "PDF Tools",
  Images: "Image Tools",
  Security: "Password & Security",
  Utilities: "Utilities",
};

/**
 * Single source of truth for every tool on the site. The home page grid,
 * the header navigation, and per-tool SEO metadata are all derived from
 * this list — adding a tool is one entry here plus one route/page.
 */
export const tools: ToolDefinition[] = [
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    tagline: "Combine multiple PDF documents into a single file.",
    icon: FileDown,
    category: "PDF",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline: "Reduce image file sizes without losing visible quality.",
    icon: Image,
    category: "Images",
  },
  {
    slug: "password-toolkit",
    name: "Password Toolkit",
    tagline: "Generate strong passwords and check their strength.",
    icon: KeyRound,
    category: "Security",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    tagline: "Hash text with SHA-1, SHA-256, SHA-384, or SHA-512.",
    icon: Fingerprint,
    category: "Security",
  },
  {
    slug: "pdf-split",
    name: "PDF Split",
    tagline: "Split a PDF by page ranges or extract individual pages.",
    icon: Scissors,
    category: "PDF",
  },
  {
    slug: "pdf-rotate",
    name: "PDF Rotate",
    tagline: "Rotate pages by 90° increments, individually or all at once.",
    icon: RotateCw,
    category: "PDF",
  },
  {
    slug: "pdf-remove-pages",
    name: "PDF Page Remover",
    tagline: "Remove unwanted pages from your PDF.",
    icon: FileX2,
    category: "PDF",
  },
  {
    slug: "pdf-lock",
    name: "PDF Lock / Unlock",
    tagline: "Protect a PDF with a password or remove its protection.",
    icon: LockKeyhole,
    category: "PDF",
  },
  {
    slug: "image-resize",
    name: "Resize & Convert",
    tagline: "Resize images and convert between JPG, PNG, and WebP.",
    icon: Crop,
    category: "Images",
    planned: true,
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    tagline: "Combine multiple images into a single PDF document.",
    icon: FileImage,
    category: "PDF",
    planned: true,
  },
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    tagline: "Create QR codes from any text or URL and download them.",
    icon: QrCode,
    category: "Utilities",
    planned: true,
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}