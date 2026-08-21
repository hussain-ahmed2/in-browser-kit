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
  Code,
  Braces,
  Ruler,
  Search,
  KeySquare,
  ScanSearch,
  Film,
  FileDiff,
  Table,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "PDF" | "Images" | "Security" | "Utilities" | "Video & Audio";

export type ToolIconName =
  | "Image"
  | "FileDown"
  | "KeyRound"
  | "Fingerprint"
  | "Scissors"
  | "RotateCw"
  | "FileX2"
  | "LockKeyhole"
  | "Crop"
  | "FileImage"
  | "QrCode"
  | "Code"
  | "Braces"
  | "Ruler"
  | "Search"
  | "FileImage"
  | "KeySquare"
  | "ScanSearch"
  | "Film"
  | "FileDiff"
  | "Table";

export interface ToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  icon: ToolIconName;
  category: ToolCategory;
  /** Marked for tools that are registered but not yet shipped; links are disabled. */
  planned?: boolean;
}

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
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    tagline: "Combine multiple PDF documents into a single file.",
    icon: "FileDown",
    category: "PDF",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline: "Reduce image file sizes without losing visible quality.",
    icon: "Image",
    category: "Images",
  },
  {
    slug: "media-converter",
    name: "Media Converter",
    tagline: "Convert between video and audio formats (MP4, MP3, GIF) locally in your browser.",
    icon: "Film",
    category: "Video & Audio",
  },
  {
    slug: "password-toolkit",
    name: "Password Toolkit",
    tagline: "Generate strong passwords and check their strength.",
    icon: "KeyRound",
    category: "Security",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    tagline: "Hash text with SHA-1, SHA-256, SHA-384, or SHA-512.",
    icon: "Fingerprint",
    category: "Security",
  },
  {
    slug: "pdf-split",
    name: "PDF Split",
    tagline: "Split a PDF by page ranges or extract individual pages.",
    icon: "Scissors",
    category: "PDF",
  },
  {
    slug: "pdf-rotate",
    name: "PDF Rotate",
    tagline: "Rotate pages by 90° increments, individually or all at once.",
    icon: "RotateCw",
    category: "PDF",
  },
  {
    slug: "pdf-remove-pages",
    name: "PDF Page Remover",
    tagline: "Remove unwanted pages from your PDF.",
    icon: "FileX2",
    category: "PDF",
  },
  {
    slug: "pdf-lock",
    name: "PDF Lock / Unlock",
    tagline: "Protect a PDF with a password or remove its protection.",
    icon: "LockKeyhole",
    category: "PDF",
  },
  {
    slug: "image-resize",
    name: "Resize & Convert",
    tagline: "Resize images and convert between JPG, PNG, and WebP.",
    icon: "Crop",
    category: "Images",
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    tagline: "Combine multiple images into a single PDF document.",
    icon: "FileImage",
    category: "PDF",
  },
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    tagline: "Create QR codes from any text or URL and download them.",
    icon: "QrCode",
    category: "Utilities",
  },
  {
    slug: "base64",
    name: "Base64 Encode/Decode",
    tagline: "Convert between text/files and Base64 encoding.",
    icon: "Code",
    category: "Utilities",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    tagline: "Format, validate, and visualize JSON with tree view.",
    icon: "Braces",
    category: "Utilities",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    tagline: "Generate UUIDs (v1, v4, v7) with customizable formatting.",
    icon: "Fingerprint",
    category: "Utilities",
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    tagline: "Convert between units of length, weight, temperature, data, time, area, volume, and speed.",
    icon: "Ruler",
    category: "Utilities",
  },
  {
    slug: "diff-checker",
    name: "Text & Code Diff Checker",
    tagline: "Compare two blocks of text or code and highlight differences.",
    icon: "FileDiff",
    category: "Utilities",
  },
  {
    slug: "csv-json-converter",
    name: "CSV ↔ JSON Converter",
    tagline: "Convert CSV spreadsheets into JSON arrays (and vice versa) instantly.",
    icon: "Table",
    category: "Utilities",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    tagline: "Test regular expressions with live match highlighting, capture groups, and substitution preview.",
    icon: "Search",
    category: "Utilities",
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    tagline: "Convert PDF pages to high-quality images (PNG, JPEG, WebP) with customizable DPI and quality.",
    icon: "FileImage",
    category: "PDF",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Decode JWT tokens and inspect header, payload, and signature claims.",
    icon: "KeySquare",
    category: "Utilities",
  },
  {
    slug: "image-metadata",
    name: "Image Metadata",
    tagline: "Inspect EXIF, IPTC, ICC, and GPS metadata embedded in your images.",
    icon: "ScanSearch",
    category: "Images",
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolIcon(iconName: ToolIconName): LucideIcon {
  const iconMap: Record<ToolIconName, LucideIcon> = {
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
    Code,
    Braces,
    Ruler,
    Search,
    KeySquare,
    ScanSearch,
    Film,
    FileDiff,
    Table,
  };
  return iconMap[iconName];
}